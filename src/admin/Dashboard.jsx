import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'

const allProducts = 12
const allBackdrops = 12

export default function Dashboard() {
  const { orders, updateOrderStatus } = useCart()
  const navigate = useNavigate()

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const pending   = orders.filter(o => o.status === 'Pending' && o.orderType !== 'decoration')
  const confirmed = orders.filter(o => o.status === 'Confirmed').length
  const delivered = orders.filter(o => o.status === 'Delivered').length
  const recent    = orders.filter(o => o.status !== 'Pending').slice(0, 5)

  const stats = [
    { icon: '📦', label: 'Total Orders',   value: orders.length,                  color: '#0ea5e9', bg: '#e0f2fe' },
    { icon: '⏳', label: 'Pending',         value: pending.length,                 color: '#d97706', bg: '#fef3c7' },
    { icon: '✅', label: 'Confirmed',       value: confirmed,                      color: '#16a34a', bg: '#dcfce7' },
    { icon: '🚚', label: 'Delivered',       value: delivered,                      color: '#2563eb', bg: '#dbeafe' },
    { icon: '💰', label: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString()}`, color: '#d97706', bg: '#fef3c7' },
    { icon: '🛍️', label: 'Products',        value: allProducts,                    color: '#0ea5e9', bg: '#e0f2fe' },
  ]

  return (
    <div>
      <h2 className={styles.heading}>Dashboard</h2>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <p className={styles.statLabel}>{s.label}</p>
              <h3 className={styles.statValue} style={{ color: s.color }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Orders */}
      {pending.length > 0 && (
        <div className={`${styles.section} ${styles.pendingSection}`}>
          <div className={styles.sectionHeader}>
            <h3>⏳ Pending Orders <span className={styles.pendingCount}>{pending.length}</span></h3>
            <span className={styles.pendingHint}>Review and confirm or decline</span>
          </div>
          <div className={styles.pendingList}>
            {pending.map(o => (
              <div key={o.id} className={styles.pendingCard}>
                <div className={styles.pendingInfo}>
                  <p className={styles.pendingId}>{o.id}</p>
                  <p className={styles.pendingName}>{o.customer?.name}</p>
                  <p className={styles.pendingMeta}>
                    📞 {o.customer?.phone}
                    {o.customer?.pickupDate && <> &nbsp;·&nbsp; 📦 {o.customer.pickupDate}</>}
                    {o.customer?.returnDate && <> &nbsp;·&nbsp; 🔄 {o.customer.returnDate}</>}
                  </p>
                  <p className={styles.pendingItems}>
                    {o.items?.map(i => `${i.name} ×${i.qty}`).join(', ')}
                  </p>
                </div>
                <div className={styles.pendingRight}>
                  <p className={styles.pendingTotal}>₹{o.total?.toLocaleString()}</p>
                  <div className={styles.pendingActions}>
                    <button
                      className={styles.confirmBtn}
                      onClick={async () => {
                        await updateOrderStatus(o._mongoId, 'Confirmed')
                        navigate('/admin/calendar')
                      }}
                    >✅ Confirm</button>
                    <button
                      className={styles.declineBtn}
                      onClick={() => updateOrderStatus(o._mongoId, 'Cancelled')}
                    >❌ Decline</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className={styles.section} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionHeader}>
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" className={styles.viewAll}>View All →</Link>
        </div>

        {recent.length === 0 ? (
          <div className={styles.empty}>No orders yet.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Pickup Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(o => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>{o.id}</td>
                    <td>{o.customer?.name}</td>
                    <td>{o.customer?.pickupDate || '-'}</td>
                    <td>{o.items?.reduce((s, i) => s + i.qty, 0)} item(s)</td>
                    <td>₹{o.total?.toLocaleString()}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>
                      <div className={styles.rowActions}>
                        {o.status !== 'Confirmed' && o.status !== 'Cancelled' && (
                          <button className={styles.confirmBtnSm}
                            onClick={async () => { await updateOrderStatus(o._mongoId, 'Confirmed'); navigate('/admin/calendar') }}>
                            ✅
                          </button>
                        )}
                        {o.status !== 'Cancelled' && (
                          <button className={styles.declineBtnSm}
                            onClick={() => updateOrderStatus(o._mongoId, 'Cancelled')}>
                            ❌
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    Pending:   { bg: '#fef3c7', color: '#d97706' },
    Confirmed: { bg: '#e0f2fe', color: '#0ea5e9' },
    Delivered: { bg: '#dcfce7', color: '#16a34a' },
    Cancelled: { bg: '#fee2e2', color: '#dc2626' },
  }
  const s = map[status] || map.Confirmed
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: '0.75rem', fontWeight: 700,
      padding: '0.2rem 0.7rem', borderRadius: '999px'
    }}>
      {status}
    </span>
  )
}
