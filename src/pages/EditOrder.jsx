import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import styles from './EditOrder.module.css'

export default function EditOrder() {
  const { orderId } = useParams()
  const { myOrders: orders, editOrder } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const order = orders.find(o => o.id === orderId)

  const [items, setItems] = useState(order ? [...order.items] : [])
  const [customer, setCustomer] = useState(order ? { ...order.customer } : {})
  const [saving, setSaving] = useState(false)

  if (!order) {
    return (
      <main className={styles.empty}>
        <p>Order not found.</p>
        <Link to="/orders" className={styles.btn}>Back to Orders</Link>
      </main>
    )
  }

  if (order.status !== 'Pending') {
    return (
      <main className={styles.empty}>
        <div className={styles.icon}>🔒</div>
        <h2>Cannot Edit Order</h2>
        <p>Only orders with status <strong>Pending</strong> can be edited. Once confirmed by admin, changes must be requested directly.</p>
        <Link to="/orders" className={styles.btn}>Back to Orders</Link>
      </main>
    )
  }

  const updateQty = (id, source, qty) => {
    if (qty < 1) {
      setItems(prev => prev.filter(i => !(i.id === id && i.source === source)))
    } else {
      setItems(prev => prev.map(i =>
        i.id === id && i.source === source ? { ...i, qty } : i
      ))
    }
  }

  const handleSave = async () => {
    if (items.length === 0) return
    setSaving(true)
    try {
      await editOrder(order._mongoId, items, customer)
      showToast('Order updated successfully! ✅')
      navigate('/orders')
    } catch (err) {
      showToast('Failed to update order.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const total = items.reduce((sum, item) => {
    const num = parseInt(item.price.replace(/[^0-9]/g, '')) || 0
    return sum + num * item.qty
  }, 0)

  return (
    <main>
      <section className={styles.hero}>
        <h1>Edit Order</h1>
        <p>{order.id}</p>
      </section>

      <section className={styles.section}>
        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.itemsBox}>
            <h2>Order Items</h2>
            {items.length === 0 && (
              <p className={styles.noItems}>All items removed. Add items back or cancel.</p>
            )}
            {items.map(item => (
              <div key={`${item.source}-${item.id}`} className={styles.item}>
                <img src={item.image} alt={item.name} />
                <div className={styles.itemInfo}>
                  <span className={styles.source}>{item.source}</span>
                  <h3>{item.name}</h3>
                  <p>{item.price}</p>
                </div>
                <div className={styles.qtyControl}>
                  <button onClick={() => updateQty(item.id, item.source, item.qty - 1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.source, item.qty + 1)}>+</button>
                </div>
                <button className={styles.remove} onClick={() => updateQty(item.id, item.source, 0)}>🗑</button>
              </div>
            ))}

            <div className={styles.totalRow}>
              <span>New Total</span>
              <strong>₹{total.toLocaleString()}</strong>
            </div>
          </div>

          {/* Customer details */}
          <div className={styles.formBox}>
            <h2>Update Details</h2>
            <div className={styles.dateFrame}>
              <span className={styles.dateFrameTitle}>📅 Event Schedule</span>
              <div className={styles.dateCard}>
                <span className={styles.dateIcon}>🎉</span>
                <div className={styles.dateInputWrap}>
                  <span className={styles.dateLabel}>Event Date</span>
                  <input type="date" value={customer.date || ''} onChange={e => setCustomer({ ...customer, date: e.target.value })} />
                </div>
              </div>
              <div className={styles.dateDivider} />
              <div className={styles.dateRow}>
                <div className={styles.dateCard}>
                  <span className={styles.dateIcon}>📦</span>
                  <div className={styles.dateInputWrap}>
                    <span className={styles.dateLabel}>Pickup Date</span>
                    <input type="date" value={customer.pickupDate || ''} onChange={e => setCustomer({ ...customer, pickupDate: e.target.value })} />
                  </div>
                </div>
                <div className={styles.dateCard}>
                  <span className={styles.dateIcon}>🔄</span>
                  <div className={styles.dateInputWrap}>
                    <span className={styles.dateLabel}>Return Date</span>
                    <input type="date" value={customer.returnDate || ''} onChange={e => setCustomer({ ...customer, returnDate: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.field}>
              <label>Venue Address</label>
              <textarea rows={2} value={customer.address || ''} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Home Address</label>
              <textarea rows={2} value={customer.homeAddress || ''} onChange={e => setCustomer({ ...customer, homeAddress: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Special Notes</label>
              <textarea rows={2} value={customer.note || ''} onChange={e => setCustomer({ ...customer, note: e.target.value })} />
            </div>

            <div className={styles.actions}>
              <Link to="/orders" className={styles.cancelBtn}>Cancel</Link>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving || items.length === 0}>
                {saving ? 'Saving...' : '✅ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
