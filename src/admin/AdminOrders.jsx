import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { StatusBadge } from './Dashboard'
import { generateInvoice, sendInvoiceWhatsApp } from '../utils/generateInvoice'
import styles from './AdminOrders.module.css'

const STATUS_OPTIONS = ['Confirmed', 'Delivered', 'Completed', 'Cancelled']

const returnColors = {
  pending:      { background: '#fef3c7', color: '#d97706' },
  returned:     { background: '#dcfce7', color: '#16a34a' },
  partial:      { background: '#dbeafe', color: '#2563eb' },
  not_returned: { background: '#fee2e2', color: '#dc2626' },
}

export default function AdminOrders() {
  const { orders, updateOrderStatus, updateReturnStatus } = useCart()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [viewMode, setViewMode] = useState('active') // 'active' or 'past'
  const [expanded, setExpanded] = useState(null)

  // Only rental orders (not decoration)
  const activeOrders = orders.filter(o => o.orderType !== 'decoration' && (o.status === 'Confirmed' || o.status === 'Delivered' || o.status === 'Pending'))
  const pastOrders = orders.filter(o => o.orderType !== 'decoration' && (o.status === 'Completed' || o.status === 'Cancelled'))

  const ordersToShow = viewMode === 'active' ? activeOrders : pastOrders

  const filtered = ordersToShow.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search)
    const matchStatus = filterStatus === 'All' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div>
      <h2 className={styles.heading}>Orders Management</h2>

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
        <button
          className={`${styles.filter} ${viewMode === 'active' ? styles.filterActive : ''}`}
          onClick={() => { setViewMode('active'); setFilterStatus('All') }}
          style={{ fontSize: '0.95rem', fontWeight: 700 }}
        >
          📋 Active Orders ({activeOrders.length})
        </button>
        <button
          className={`${styles.filter} ${viewMode === 'past' ? styles.filterActive : ''}`}
          onClick={() => { setViewMode('past'); setFilterStatus('All') }}
          style={{ fontSize: '0.95rem', fontWeight: 700 }}
        >
          📦 Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍  Search by order ID, name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.filters}>
          {['All', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              className={`${styles.filter} ${filterStatus === s ? styles.filterActive : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No orders found.</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(order => (
            <div key={order.id} className={styles.card}>
              {/* Header Row */}
              <div className={styles.cardHeader} onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className={styles.headerLeft}>
                  <span className={styles.orderId}>{order.id}</span>
                  <span className={styles.meta}>👤 {order.customer.name}</span>
                  <span className={styles.meta}>📞 {order.customer.phone}</span>
                  <span className={styles.meta}>📅 Event: {order.customer.date}</span>
                  {order.customer.pickupDate && <span className={styles.meta}>📦 Pickup: {order.customer.pickupDate}</span>}
                  {order.customer.returnDate && <span className={styles.meta}>🔄 Return: {order.customer.returnDate}</span>}
                </div>
                <div className={styles.headerRight}>
                  <strong className={styles.total}>₹{order.total?.toLocaleString()}</strong>
                  {order.deposit > 0 && (
                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700 }}>
                      💵 Dep: ₹{order.deposit?.toLocaleString()}
                    </span>
                  )}
                  {order.balance > 0 && (
                    <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700 }}>
                      Due: ₹{order.balance?.toLocaleString()}
                    </span>
                  )}
                  <StatusBadge status={order.status} />
                  {order.returnStatus && (                    <span style={{
                      ...returnColors[order.returnStatus],
                      fontSize: '0.72rem', fontWeight: 700,
                      padding: '0.2rem 0.7rem', borderRadius: '999px'
                    }}>
                      {{
                        pending: '⏳ Return Pending',
                        returned: '✅ Returned',
                        partial: '🔵 Partial Return',
                        not_returned: '❌ Not Returned',
                      }[order.returnStatus]}
                    </span>
                  )}
                  <button
                    className={styles.invoiceBtn}
                    onClick={e => { e.stopPropagation(); generateInvoice(order) }}
                    title="Download Invoice PDF"
                  >
                    📄 Invoice
                  </button>
                  <button
                    className={styles.whatsappBtn}
                    onClick={e => { e.stopPropagation(); sendInvoiceWhatsApp(order) }}
                    title="Send via WhatsApp"
                  >
                    💬 WhatsApp
                  </button>
                  <span className={styles.chevron}>{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded */}
              {expanded === order.id && (
                <div className={styles.cardBody}>
                  <div className={styles.twoCol}>
                    {/* Items */}
                    <div>
                      <h4>Items</h4>
                      {order.items.map((item, i) => (
                        <div key={i} className={styles.item}>
                          <img src={item.image} alt={item.name} />
                          <div className={styles.itemInfo}>
                            <p>{item.name}</p>
                            <span>{item.source}</span>
                          </div>
                          <div className={styles.itemRight}>
                            <span>x{item.qty}</span>
                            <strong>{item.price}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Details + Status */}
                    <div>
                      <h4>Customer Details</h4>
                      <div className={styles.details}>
                        <Row label="Name" value={order.customer.name} />
                        <Row label="Phone" value={order.customer.phone} />
                        {order.customer.email && <Row label="Email" value={order.customer.email} />}
                        <Row label="Event Date" value={order.customer.date} />
                        {order.customer.pickupDate && <Row label="Pickup" value={order.customer.pickupDate} />}
                        {order.customer.returnDate && <Row label="Return" value={order.customer.returnDate} />}
                        <Row label="Address" value={order.customer.address} />
                        {order.customer.note && <Row label="Notes" value={order.customer.note} />}
                      </div>

                      {/* Deposit summary */}
                      <div style={{ background: '#f8f8f8', borderRadius: '10px', padding: '0.9rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#555', marginBottom: '0.4rem' }}>
                          <span>Total</span><span>₹{order.total?.toLocaleString()}</span>
                        </div>
                        {order.deposit > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, marginBottom: '0.4rem' }}>
                            <span>💵 Deposit Paid</span><span>− ₹{order.deposit?.toLocaleString()}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, color: order.balance > 0 ? '#dc2626' : '#16a34a', borderTop: '1px solid #e5e7eb', paddingTop: '0.4rem' }}>
                          <span>{order.balance > 0 ? 'Balance Due' : 'Fully Paid'}</span>
                          <span>₹{Math.max(0, order.balance ?? 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Edit History */}
                      {order.editHistory && order.editHistory.length > 0 && (
                        <div style={{ marginTop: '1.2rem' }}>
                          <h4>✏️ Edit History ({order.editHistory.length})</h4>
                          {order.editHistory.map((h, i) => (
                            <div key={i} style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.8rem', marginBottom: '0.6rem' }}>
                              <p style={{ fontSize: '0.78rem', color: '#a16207', fontWeight: 700, marginBottom: '0.4rem' }}>
                                🕐 {new Date(h.editedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {h.changes.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>No item changes (details updated only)</p>
                              ) : h.changes.map((c, j) => (
                                <p key={j} style={{ fontSize: '0.82rem', color: '#0f172a', margin: '0.2rem 0' }}>
                                  {c.type === 'added' && `➕ Added: ${c.name} (x${c.qty})`}
                                  {c.type === 'removed' && `➖ Removed: ${c.name} (x${c.qty})`}
                                  {c.type === 'qty_changed' && `🔄 ${c.name}: qty ${c.from} → ${c.to}`}
                                </p>
                              ))}
                              <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.3rem' }}>
                                Previous total: ₹{h.previousTotal?.toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={styles.actionRow}>
                        <div className={styles.actionGroup}>
                          <span className={styles.actionLabel}>Order Status</span>
                          <div className={styles.statusBtns}>
                            <button
                              className={`${styles.statusBtn} ${order.status === 'Delivered' ? styles.statusDelivered : ''}`}
                              onClick={() => updateOrderStatus(order._mongoId, 'Delivered')}
                            >🚚 Delivered</button>
                            <button
                              className={`${styles.statusBtn} ${order.status === 'Completed' ? styles.statusCompleted : ''}`}
                              onClick={() => updateOrderStatus(order._mongoId, 'Completed')}
                            >✅ Completed</button>
                            <button
                              className={`${styles.statusBtn} ${order.status === 'Cancelled' ? styles.statusCancelled : ''}`}
                              onClick={() => updateOrderStatus(order._mongoId, 'Cancelled')}
                            >❌ Cancelled</button>
                          </div>
                        </div>
                        <div className={styles.actionGroup}>
                          <span className={styles.actionLabel}>Return Status</span>
                          <div className={styles.statusBtns}>
                            <button
                              className={`${styles.statusBtn} ${order.returnStatus === 'returned' ? styles.returnReturned : ''}`}
                              onClick={() => updateReturnStatus(order._mongoId, 'returned')}
                            >📦 Returned</button>
                            <button
                              className={`${styles.statusBtn} ${order.returnStatus === 'partial' ? styles.returnPartial : ''}`}
                              onClick={() => updateReturnStatus(order._mongoId, 'partial')}
                            >⚠️ Partial</button>
                            <button
                              className={`${styles.statusBtn} ${order.returnStatus === 'not_returned' ? styles.returnNot : ''}`}
                              onClick={() => updateReturnStatus(order._mongoId, 'not_returned')}
                            >❌ Not Returned</button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.78rem', color: '#888', minWidth: '70px' }}>{label}</span>
      <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 500 }}>{value}</span>
    </div>
  )
}




