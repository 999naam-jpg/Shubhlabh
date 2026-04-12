import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useReviews } from '../context/ReviewContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { generateInvoice } from '../utils/generateInvoice'
import PhotoCarousel from '../components/PhotoCarousel'
import styles from './Orders.module.css'

const ADMIN_EMAIL = 'monilkumbhani@gmail.com'

const STATUS = {
  Confirmed: { color: '#0ea5e9', bg: '#e0f2fe', icon: '🟣' },
  Delivered:  { color: '#16a34a', bg: '#dcfce7', icon: '🟢' },
  Completed:  { color: '#8b5cf6', bg: '#f3e8ff', icon: '✅' },
  Cancelled:  { color: '#dc2626', bg: '#fee2e2', icon: '🔴' },
}

const RETURN_LABELS = {
  pending:      { label: 'Return Pending',    bg: '#fef3c7', color: '#d97706' },
  returned:     { label: 'Items Returned',    bg: '#dcfce7', color: '#16a34a' },
  partial:      { label: 'Partial Return',    bg: '#dbeafe', color: '#2563eb' },
  not_returned: { label: 'Not Returned',      bg: '#fee2e2', color: '#dc2626' },
}

export default function Orders() {
  const { myOrders: orders } = useCart()
  const { reviews, submitReview, editReview } = useReviews()
  const { user } = useAuth()
  const { showToast } = useToast()

  if (orders.length === 0) {
    return (
      <main className={styles.emptyPage}>
        <div className={styles.emptyBox}>
          <div className={styles.emptyIcon}>📦</div>
          <h2>No orders yet</h2>
          <p>Browse our products and place your first order.</p>
          <div className={styles.emptyLinks}>
            <Link to="/products" className={styles.btn}>Browse Products</Link>
            <Link to="/backdrops" className={styles.btnOutline}>Backdrops</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1>My Orders</h1>
      </div>

      {/* Orders list */}
      <div className={styles.list}>
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            reviews={reviews}
            submitReview={submitReview}
            editReview={editReview}
            user={user}
            showToast={showToast}
          />
        ))}
      </div>
    </main>
  )
}

function OrderCard({ order, reviews, submitReview, editReview, user, showToast }) {
  const [open, setOpen] = useState(false)
  const [decoModal, setDecoModal] = useState(false)
  const [decoDesc, setDecoDesc] = useState('')
  const [decoTotal, setDecoTotal] = useState('')
  const [decoDeposit, setDecoDeposit] = useState('')
  const [decoSaving, setDecoSaving] = useState(false)
  const isAdmin = user?.email === ADMIN_EMAIL
  const s = STATUS[order.status] || STATUS.Confirmed
  const ret = order.returnStatus ? RETURN_LABELS[order.returnStatus] : null

  const handleSelfDecorate = async (e) => {    e.preventDefault()
    setDecoSaving(true)
    try {
      const orderId = `DECO-${Date.now()}`
      const total = parseInt(decoTotal) || 0
      const deposit = parseInt(decoDeposit) || 0
      await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderType: 'decoration',
          userId: null,
          status: 'Confirmed',
          customer: {
            name: order.customer?.name,
            phone: order.customer?.phone,
            email: order.customer?.email,
            address: order.customer?.address,
            date: order.customer?.date,
          },
          items: [{ id: 'deco', name: decoDesc || 'Decoration Service', price: `₹${total}`, image: '', source: 'Decoration', qty: 1 }],
          total, deposit, balance: total - deposit,
          editHistory: [],
        }),
      })
      showToast('Decoration order created! 🎨')
      setDecoModal(false)
      setDecoDesc(''); setDecoTotal(''); setDecoDeposit('')
    } catch { showToast('Failed to create decoration order', 'error') }
    finally { setDecoSaving(false) }
  }

  const orderDate = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000)
    : null

  return (
    <div className={styles.card}>
      {/* Color bar */}
      <div className={styles.bar} style={{ background: order.orderType === 'decoration' ? '#8b5cf6' : s.color }} />

      {/* Card header — always visible */}
      <div className={styles.cardHead} onClick={() => setOpen(!open)}>
        <div className={styles.cardHeadLeft}>
          <div>
            <p className={styles.oid}>
              {order.orderType === 'decoration' && <span style={{ background: '#f3e8ff', color: '#8b5cf6', fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '999px', marginRight: '0.4rem' }}>🎨 Decoration</span>}
              {order.id}
            </p>
            {orderDate && (
              <p className={styles.odate}>
                {orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        <div className={styles.cardHeadRight}>
          <div className={styles.totalBlock}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalAmt}>₹{order.total?.toLocaleString()}</span>
          </div>
          <span className={styles.arrow}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Quick info strip */}
      <div className={styles.strip}>
        {order.customer?.date && <span>🎉 {order.customer.date}</span>}
        {order.customer?.pickupDate && <span>📦 {order.customer.pickupDate}</span>}
        {order.customer?.returnDate && <span>🔄 {order.customer.returnDate}</span>}
        {ret && (
          <span className={styles.retBadge} style={{ background: ret.bg, color: ret.color }}>
            {ret.label}
          </span>
        )}
        {order.discount > 0 && (
          <span className={styles.discBadge}>🏷️ ₹{order.discount?.toLocaleString()} off</span>
        )}
      </div>

      {/* Action buttons */}
      <div className={styles.cardActions}>
        {order.status === 'Pending' && (
          <Link to={`/orders/${order.id}/edit`} className={styles.actionBtn} style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
            ✏️ Edit
          </Link>
        )}
        {order.status !== 'Completed' && (
          <button className={styles.actionBtn} style={{ background: '#0f172a', color: '#fff' }}
            onClick={() => generateInvoice(order)}>
            📄 Invoice
          </button>
        )}
        {isAdmin && order.orderType !== 'decoration' && (
          <button className={styles.actionBtn} style={{ background: '#f3e8ff', color: '#8b5cf6' }}
            onClick={() => setDecoModal(true)}>
            🎨 Self Decorate
          </button>
        )}
      </div>

      {/* Self Decorate Modal */}
      {decoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setDecoModal(false)}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', width: '100%', maxWidth: 420 }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>🎨 Self Decorate — {order.customer?.name}</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              📅 {order.customer?.date} &nbsp;·&nbsp; 📍 {order.customer?.address}
            </p>
            <form onSubmit={handleSelfDecorate} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.2rem' }}>Decoration Description</label>
                <textarea rows={2} value={decoDesc} onChange={e => setDecoDesc(e.target.value)}
                  placeholder="e.g. Full hall decoration with flowers and lights"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.2rem' }}>Total Amount (₹) *</label>
                  <input type="number" required value={decoTotal} onChange={e => setDecoTotal(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.2rem' }}>Deposit (₹)</label>
                  <input type="number" value={decoDeposit} onChange={e => setDecoDeposit(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setDecoModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={decoSaving}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: 8, background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  {decoSaving ? 'Creating...' : '🎨 Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded details */}
      {open && (
        <div className={styles.details}>

          {/* Items */}
          <div className={styles.section}>
            <h4>🛍️ Items</h4>
            {order.items?.map((item, i) => (
              <div key={i} className={styles.item}>
                <img src={item.image} alt={item.name} />
                <div className={styles.itemInfo}>
                  <p>{item.name}</p>
                  <span>{item.source}</span>
                </div>
                <div className={styles.itemRight}>
                  <span>×{item.qty}</span>
                  <strong>{item.price}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery */}
          <div className={styles.section}>
            <h4>📍 Delivery</h4>
            <div className={styles.infoGrid}>
              {order.customer?.name    && <InfoRow label="Name"    value={order.customer.name} />}
              {order.customer?.phone   && <InfoRow label="Phone"   value={order.customer.phone} />}
              {order.customer?.email   && <InfoRow label="Email"   value={order.customer.email} />}
              {order.customer?.address && (
                <div className={styles.addrBox}>
                  <span>Venue</span><p>{order.customer.address}</p>
                </div>
              )}
              {order.customer?.homeAddress && (
                <div className={`${styles.addrBox} ${styles.homeAddr}`}>
                  <span>Home</span><p>{order.customer.homeAddress}</p>
                </div>
              )}
              {order.customer?.note && <InfoRow label="Notes" value={order.customer.note} />}
            </div>
          </div>

          {/* Payment */}
          <div className={styles.section}>
            <h4>💳 Payment</h4>
            <div className={styles.payBox}>
              <div className={styles.payRow}><span>Product Amount</span><span>₹{order.total?.toLocaleString()}</span></div>
              {order.deposit > 0 && (
                <div className={styles.payRow} style={{ color: '#0ea5e9' }}>
                  <span>Security Deposit</span>
                  <span>+ ₹{order.deposit?.toLocaleString()}</span>
                </div>
              )}
              <div className={styles.payTotal}>
                <span>Final Amount</span>
                <strong>₹{((order.total || 0) + (order.deposit || 0)).toLocaleString()}</strong>
              </div>
              {order.deposit > 0 && (
                <div style={{
                  marginTop: '0.8rem',
                  paddingTop: '0.8rem',
                  borderTop: '1px dashed #e5e7eb',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  padding: '0.7rem 0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>🔒 Deposit Refund</span>
                  <span style={{ fontSize: '0.85rem', color: '#15803d' }}>
                    Return items by <strong>{order.customer?.returnDate || '—'}</strong> to get <strong>₹{order.deposit?.toLocaleString()}</strong> refunded in full.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Edit history */}
          {order.editHistory?.length > 0 && (
            <div className={styles.section}>
              <h4>✏️ Edit History</h4>
              {order.editHistory.map((h, i) => (
                <div key={i} className={styles.histEntry}>
                  <p className={styles.histTime}>
                    {new Date(h.editedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {h.changes.length === 0
                    ? <p className={styles.histChange}>Details updated</p>
                    : h.changes.map((c, j) => (
                      <p key={j} className={styles.histChange}>
                        {c.type === 'added'       && `➕ Added ${c.name} ×${c.qty}`}
                        {c.type === 'removed'     && `➖ Removed ${c.name}`}
                        {c.type === 'qty_changed' && `🔄 ${c.name}: ${c.from} → ${c.to}`}
                      </p>
                    ))
                  }
                </div>
              ))}
            </div>
          )}

          {/* Review */}
          {(order.status === 'Delivered' || order.status === 'Completed') && (
            <ReviewSection
              order={order}
              reviews={reviews}
              submitReview={submitReview}
              editReview={editReview}
              user={user}
              showToast={showToast}
            />
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span>{label}</span><p>{value}</p>
    </div>
  )
}

function ReviewSection({ order, reviews, submitReview, editReview, user, showToast }) {
  const existing = reviews.find(r => r.orderId === order.id)
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(existing?.rating || 5)
  const [text, setText] = useState(existing?.text || '')
  const [submitting, setSubmitting] = useState(false)

  if (existing && !editing) {
    return (
      <div className={styles.section}>
        <h4>⭐ Your Review</h4>
        <div className={styles.reviewDone}>
          <div className={styles.reviewStars}>{'★'.repeat(existing.rating)}{'☆'.repeat(5 - existing.rating)}</div>
          {existing.decorationPhotos?.length > 0 && <PhotoCarousel photos={existing.decorationPhotos} />}
          <p>"{existing.text}"</p>
          <button
            onClick={() => { setRating(existing.rating); setText(existing.text); setEditing(true) }}
            style={{ marginTop: '0.6rem', background: '#e0f2fe', color: '#0ea5e9', border: 'none', borderRadius: '8px', padding: '0.4rem 1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
          >✏️ Edit Review</button>
        </div>
      </div>
    )
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      if (editing && existing) {
        await editReview(existing._id, { rating, text, decorationPhotos: existing.decorationPhotos })
        showToast('Review updated! ✅')
        setEditing(false)
      } else {
        await submitReview({
          orderId: order.id,
          name: user?.displayName || order.customer?.name || 'Customer',
          event: order.customer?.event || 'Event',
          rating, text,
          userPhoto: user?.photoURL || '',
          decorationPhotos: [],
        })
        showToast('Review submitted! Thank you 🌟')
      }
    } catch {
      showToast('Failed to submit review.', 'error')
    } finally { setSubmitting(false) }
  }

  return (
    <div className={styles.section}>
      <h4>{editing ? '✏️ Edit Review' : '⭐ Leave a Review'}</h4>
      <form onSubmit={handleSubmit} className={styles.reviewForm}>
        <div className={styles.starRow}>
          {[1,2,3,4,5].map(n => (
            <button type="button" key={n} onClick={() => setRating(n)}
              className={`${styles.star} ${n <= rating ? styles.starOn : ''}`}>★</button>
          ))}
        </div>
        <textarea rows={3} placeholder="How was your experience?" value={text}
          onChange={e => setText(e.target.value)} required />
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="submit" className={styles.reviewBtn} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? '✅ Save Changes' : '🌟 Submit Review'}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(false)}
              style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
