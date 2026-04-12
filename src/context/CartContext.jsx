import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || [] } catch { return [] }
  })
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { fetchOrders() }, [user])

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await api.getOrders()
      setOrders(data.map(o => ({ ...o, _mongoId: o._id, id: o.orderId })))
    } catch (err) { console.error('Orders fetch error:', err) }
    finally { setLoadingOrders(false) }
  }

  // Client sees their rental orders (by userId) + decoration orders admin created for their email
  const myOrders = user ? orders.filter(o =>
    o.userId === user.uid ||
    (o.orderType === 'decoration' && o.customer?.email && o.customer.email.toLowerCase() === user.email?.toLowerCase())
  ) : []

  const addToCart = (item, qty = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id && i.source === item.source)
      if (exists) return prev.map(i => i.id === item.id && i.source === item.source ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...item, qty }]
    })
  }

  const removeFromCart = (id, source) => setCart(prev => prev.filter(i => !(i.id === id && i.source === source)))

  const updateQty = (id, source, qty) => {
    if (qty < 1) return removeFromCart(id, source)
    setCart(prev => prev.map(i => i.id === id && i.source === source ? { ...i, qty } : i))
  }

  const placeOrder = async (formData, cartItems) => {
    const total = cartItems.reduce((sum, item) => {
      const num = parseInt(item.price.replace(/[^0-9]/g, '')) || 0
      return sum + num * item.qty
    }, 0)

    const orderId = `ORD-${Date.now()}`
    const customer = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    )

    const orderData = {
      orderId,
      userId: user?.uid || null,
      status: 'Pending',
      customer,
      items: cartItems.map(item => ({
        id: item.id, name: item.name, price: item.price,
        image: item.image, source: item.source, qty: item.qty,
      })),
      total,
      deposit: parseInt(formData.deposit) || 0,
      balance: total - (parseInt(formData.deposit) || 0),
      editHistory: [],
    }

    const saved = await api.createOrder(orderData)
    setOrders(prev => [{ ...saved, _mongoId: saved._id, id: saved.orderId }, ...prev])
    setCart([])
    localStorage.removeItem('cart')
    return { ...saved, id: saved.orderId }
  }

  const editOrder = async (mongoId, newItems, newCustomer) => {
    const order = orders.find(o => o._mongoId === mongoId)
    if (!order) return

    const total = newItems.reduce((sum, item) => {
      const num = parseInt(item.price.replace(/[^0-9]/g, '')) || 0
      return sum + num * item.qty
    }, 0)

    const changes = []
    newItems.forEach(ni => {
      const old = order.items.find(oi => oi.id === ni.id && oi.source === ni.source)
      if (!old) changes.push({ type: 'added', name: ni.name, qty: ni.qty })
      else if (old.qty !== ni.qty) changes.push({ type: 'qty_changed', name: ni.name, from: old.qty, to: ni.qty })
    })
    order.items.forEach(oi => {
      if (!newItems.find(ni => ni.id === oi.id && ni.source === oi.source))
        changes.push({ type: 'removed', name: oi.name, qty: oi.qty })
    })

    const updatedHistory = [...(order.editHistory || []), {
      editedAt: new Date().toISOString(), changes,
      previousItems: order.items, previousTotal: order.total,
    }]

    const updated = await api.updateOrder(mongoId, {
      items: newItems.map(item => ({ id: item.id, name: item.name, price: item.price, image: item.image, source: item.source, qty: item.qty })),
      customer: newCustomer, total, editHistory: updatedHistory,
      lastEditedAt: new Date().toISOString(),
    })
    setOrders(prev => prev.map(o => o._mongoId === mongoId ? { ...o, ...updated, _mongoId: mongoId, id: o.id } : o))
  }

  const updateOrderStatus = async (mongoId, status) => {
    try {
      await api.updateOrder(mongoId, { status })
      setOrders(prev => prev.map(o => o._mongoId === mongoId ? { ...o, status } : o))
    } catch (err) { console.error(err) }
  }

  const updateReturnStatus = async (mongoId, returnStatus) => {
    try {
      await api.updateOrder(mongoId, { returnStatus })
      setOrders(prev => prev.map(o => o._mongoId === mongoId ? { ...o, returnStatus } : o))
    } catch (err) { console.error(err) }
  }

  const markOrderDone = async (mongoId) => {
    try {
      await api.updateOrder(mongoId, { orderDone: true, pickupDone: false })
      setOrders(prev => prev.map(o => o._mongoId === mongoId ? { ...o, orderDone: true, pickupDone: false } : o))
    } catch (err) { console.error(err) }
  }

  const markPickupDone = async (mongoId) => {
    try {
      await api.updateOrder(mongoId, { pickupDone: true })
      setOrders(prev => prev.map(o => o._mongoId === mongoId ? { ...o, pickupDone: true } : o))
    } catch (err) { console.error(err) }
  }

  const applyDiscount = async (mongoId, discount, discountType, discountNote) => {
    try {
      const order = orders.find(o => o._mongoId === mongoId)
      if (!order) return
      const discountAmt = discountType === 'percent' ? Math.round((order.total * discount) / 100) : parseInt(discount) || 0
      const newBalance = Math.max(0, order.total - discountAmt - (order.deposit || 0))
      await api.updateOrder(mongoId, { discount: discountAmt, discountType, discountNote: discountNote || '', balance: newBalance })
      setOrders(prev => prev.map(o => o._mongoId === mongoId ? { ...o, discount: discountAmt, discountType, discountNote, balance: newBalance } : o))
    } catch (err) { console.error(err) }
  }

  const addDeposit = async (mongoId, extraDeposit) => {
    try {
      const order = orders.find(o => o._mongoId === mongoId)
      if (!order) return
      const newDeposit = (order.deposit || 0) + (parseInt(extraDeposit) || 0)
      const newBalance = Math.max(0, order.total - (order.discount || 0) - newDeposit)
      await api.updateOrder(mongoId, { deposit: newDeposit, balance: newBalance })
      setOrders(prev => prev.map(o => o._mongoId === mongoId ? { ...o, deposit: newDeposit, balance: newBalance } : o))
    } catch (err) { console.error(err) }
  }

  const clearCart = () => { setCart([]); localStorage.removeItem('cart') }
  const totalItems = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      placeOrder, editOrder, updateOrderStatus, updateReturnStatus,
      applyDiscount, addDeposit, markOrderDone, markPickupDone,
      orders, myOrders, loadingOrders, totalItems
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
