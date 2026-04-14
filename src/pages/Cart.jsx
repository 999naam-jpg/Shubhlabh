import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import styles from './Cart.module.css'

export default function Cart() {
  const { cart, removeFromCart, updateQty, placeOrder } = useCart()
  const [ordered, setOrdered] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    date: '', pickupDate: '', returnDate: '',
    address: '', note: '',
    deposit: '', babyGender: ''
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const today = new Date().toISOString().split('T')[0]

  const handleOrder = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate dates are not in the past
    if (form.date < today) { setError('Event date cannot be in the past.'); setLoading(false); return }
    if (form.pickupDate < today) { setError('Pickup date cannot be in the past.'); setLoading(false); return }
    if (form.returnDate < form.pickupDate) { setError('Return date must be after pickup date.'); setLoading(false); return }

    try {
      const order = await placeOrder(form, cart)
      setOrderId(order.id)
      setOrdered(true)
    } catch (err) {
      console.error('Place order error:', err)
      setError(err?.code === 'permission-denied'
        ? 'Permission denied. Please make sure you are logged in.'
        : `Failed to place order: ${err?.message || 'Please check your connection and try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  if (ordered) {
    return (
      <main className={styles.successPage}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>🎉</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you! We've received your order <strong>{orderId}</strong> and will contact you shortly.</p>
          <div className={styles.emptyLinks}>
            <Link to="/orders" className={styles.btn}>View My Orders</Link>
            <Link to="/" className={styles.btnOutline}>Back to Home</Link>
          </div>
        </div>
      </main>
    )
  }

  if (cart.length === 0) {
    return (
      <main className={styles.emptyPage}>
        <div className={styles.emptyBox}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Browse our products and add items to get started.</p>
          <div className={styles.emptyLinks}>
            <Link to="/products" className={styles.btn}>Browse Products</Link>
            <Link to="/backdrops" className={styles.btnOutline}>Backdrops & Cutouts</Link>
          </div>
        </div>
      </main>
    )
  }

  const total = cart.reduce((sum, item) => {
    const num = parseInt(item.price.replace(/[^0-9]/g, '')) || 0
    return sum + num * item.qty
  }, 0)

  return (
    <main>
      <section className={styles.hero}>
        <h1>Your Cart</h1>
        <p>{cart.reduce((s, i) => s + i.qty, 0)} item(s) selected</p>
      </section>

      <section className={styles.section}>
        <div className={styles.layout}>
          {/* Cart Items */}
          <div className={styles.items}>
            <h2>Order Items</h2>
            {cart.map(item => (
              <div key={`${item.source}-${item.id}`} className={styles.cartItem}>
                <img src={item.image} alt={item.name} />
                <div className={styles.itemInfo}>
                  <span className={styles.itemSource}>{item.source}</span>
                  <h3>{item.name}</h3>
                  <p className={styles.itemPrice}>{item.price}</p>
                </div>
                <div className={styles.qtyControl}>
                  <button onClick={() => updateQty(item.id, item.source, item.qty - 1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.source, item.qty + 1)}>+</button>
                </div>
                <button className={styles.remove} onClick={() => removeFromCart(item.id, item.source)}>🗑</button>
              </div>
            ))}
          </div>

          {/* Order Form */}
          <div className={styles.formBox}>
            <h2>Place Order</h2>
            <form onSubmit={handleOrder} className={styles.form}>
              <div className={styles.field}>
                <label>Full Name *</label>
                <input name="name" required placeholder="Your name" value={form.name} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>Phone Number *</label>
                <input name="phone" required placeholder="+91 00000 00000" value={form.phone} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} />
              </div>
              <div className={styles.dateFrame}>
                <span className={styles.dateFrameTitle}>📅 Event Schedule</span>
                <div className={styles.dateCard}>
                  <span className={styles.dateIcon}>🎉</span>
                  <div className={styles.dateInputWrap}>
                    <span className={styles.dateLabel}>Event Date</span>
                    <input name="date" type="date" required min={today} value={form.date} onChange={handleChange} />
                  </div>
                </div>
                <div className={styles.dateCard}>
                  <span className={styles.dateIcon}>📦</span>
                  <div className={styles.dateInputWrap}>
                    <span className={styles.dateLabel}>Pickup Date</span>
                    <input name="pickupDate" type="date" required min={today} value={form.pickupDate} onChange={handleChange} />
                  </div>
                </div>
                <div className={styles.dateCard}>
                  <span className={styles.dateIcon}>🔄</span>
                  <div className={styles.dateInputWrap}>
                    <span className={styles.dateLabel}>Return Date</span>
                    <input name="returnDate" type="date" required min={form.pickupDate || today} value={form.returnDate} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className={styles.field}>
                <label>Delivery / Venue Address *</label>
                <textarea name="address" required rows={2} placeholder="Venue / delivery address" value={form.address} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>👶 Baby Gender (optional)</label>
                <div className={styles.genderRow}>
                  {['Baby Boy', 'Baby Girl', 'Twins'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`${styles.genderBtn} ${form.babyGender === g ? styles.genderActive : ''}`}
                      onClick={() => setForm({ ...form, babyGender: form.babyGender === g ? '' : g })}
                    >
                      {g === 'Baby Boy' ? '👦 Baby Boy' : g === 'Baby Girl' ? '👧 Baby Girl' : '👶👶 Twins'}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label>Special Notes</label>
                <textarea name="note" rows={2} placeholder="Any special requirements..." value={form.note} onChange={handleChange} />
              </div>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Delivery</span>
                  <span className={styles.free}>Free</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total Amount</span>
                  <strong>₹{total.toLocaleString()}</strong>
                </div>
                <div className={styles.depositSection}>
                  <span className={styles.depositLabel}>🔒 Security Deposit</span>
                  <input
                    className={styles.depositInput}
                    name="deposit"
                    type="number"
                    min="0"
                    placeholder="₹0"
                    value={form.deposit}
                    onChange={e => {
                      const val = Math.max(0, parseInt(e.target.value) || 0)
                      setForm({ ...form, deposit: val === 0 ? '' : val })
                    }}
                  />
                </div>
                <div className={`${styles.summaryRow} ${styles.balanceRow}`}>
                  <span>Final Payment</span>
                  <strong>₹{Math.max(0, total + (parseInt(form.deposit) || 0)).toLocaleString()}</strong>
                </div>
              </div>

              {error && <p style={{ color: '#dc2626', fontSize: '0.88rem' }}>{error}</p>}
              <button type="submit" className={styles.orderBtn} disabled={loading}>
                {loading ? 'Placing Order...' : '✅ Place Order'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
