import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { StatusBadge } from './Dashboard'
import styles from './DecorationOrders.module.css'

const DECO_SOURCES = ['Backdrop/Cutout', 'Product']

// Filter only orders that contain decoration items
function isDecoOrder(order) {
  return order.items.some(i =>
    i.source === 'Backdrop/Cutout' ||
    ['Decor', 'Seating', 'Tables', 'Catering', 'Audio/Visual'].includes(i.category)
  )
}

export default function DecorationOrders() {
  const { orders, updateOrderStatus } = useCart()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')

  const decoOrders = orders.filter(isDecoOrder)

  const filtered = decoOrders.filter(o => {
    const matchSearch =
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.phone?.includes(search)
    const matchStatus = filterStatus === 'All' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  // Group items by type for each order
  const groupItems = (items) => {
    const backdrops = items.filter(i => i.source === 'Backdrop/Cutout')
    const products = items.filter(i => i.source !== 'Backdrop/Cutout')
    return { backdrops, products }
  }

  return (
    <div>
      <div className={styles.topRow}>
        <div>
          <h2 className={styles.heading}>🎨 Decoration Orders</h2>
          <p className={styles.sub}>All orders containing backdrops, cutouts & decoration items</p>
        </div>
        <div className={styles.countBadge}>{filtered.length} order{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍  Search by order ID, name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.filters}>
          {['All', 'Confirmed', 'Delivered', 'Cancelled'].map(s => (
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
        <div className={styles.empty}>No decoration orders found.</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(order => {
            const { backdrops, products } = groupItems(order.items)
            const isOpen = expanded === order.id

            return (
              <div key={order.id} className={styles.card}>
                {/* Header */}
                <div className={styles.cardHeader} onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div className={styles.headerLeft}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.meta}>👤 {order.customer?.name}</span>
                    <span className={styles.meta}>📞 {order.customer?.phone}</span>
                    {order.customer?.date && <span className={styles.meta}>🎉 Event: {order.customer.date}</span>}
                    {order.customer?.pickupDate && <span className={styles.meta}>📦 Pickup: {order.customer.pickupDate}</span>}
                    {order.customer?.returnDate && <span className={styles.meta}>🔄 Return: {order.customer.returnDate}</span>}
                  </div>
                  <div className={styles.headerRight}>
                    <strong className={styles.total}>₹{order.total?.toLocaleString()}</strong>
                    <StatusBadge status={order.status} />
                    <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className={styles.body}>
                    <div className={styles.threeCol}>

                      {/* Backdrops & Cutouts */}
                      <div className={styles.section}>
                        <h4>🖼️ Backdrops & Cutouts</h4>
                        {backdrops.length === 0 ? (
                          <p className={styles.none}>None</p>
                        ) : backdrops.map((item, i) => (
                          <ItemRow key={i} item={item} />
                        ))}
                      </div>

                      {/* Other Products */}
                      <div className={styles.section}>
                        <h4>🛍️ Other Items</h4>
                        {products.length === 0 ? (
                          <p className={styles.none}>None</p>
                        ) : products.map((item, i) => (
                          <ItemRow key={i} item={item} />
                        ))}
                      </div>

                      {/* Client Details */}
                      <div className={styles.section}>
                        <h4>👤 Client Details</h4>
                        <div className={styles.details}>
                          <Detail label="Name" value={order.customer?.name} />
                          <Detail label="Phone" value={order.customer?.phone} />
                          {order.customer?.email && <Detail label="Email" value={order.customer.email} />}
                          <Detail label="Event Date" value={order.customer?.date} />
                          {order.customer?.pickupDate && <Detail label="Pickup" value={order.customer.pickupDate} />}
                          {order.customer?.returnDate && <Detail label="Return" value={order.customer.returnDate} />}
                        </div>

                        <div className={styles.addressBox}>
                          <div className={styles.addressCard}>
                            <span>📍 Venue / Delivery Address</span>
                            <p>{order.customer?.address || '—'}</p>
                          </div>
                          {order.customer?.homeAddress && (
                            <div className={`${styles.addressCard} ${styles.homeCard}`}>
                              <span>🏠 Client Home Address</span>
                              <p>{order.customer.homeAddress}</p>
                            </div>
                          )}
                        </div>

                        {order.customer?.note && (
                          <div className={styles.noteBox}>
                            <span>📝 Notes</span>
                            <p>{order.customer.note}</p>
                          </div>
                        )}

                        {/* Status update */}
                        <h4 style={{ marginTop: '1rem' }}>Update Status</h4>
                        <div className={styles.statusBtns}>
                          {['Confirmed', 'Delivered', 'Cancelled'].map(s => (
                            <button
                              key={s}
                              className={`${styles.statusBtn} ${order.status === s ? styles.statusActive : ''}`}
                              onClick={() => updateOrderStatus(order._mongoId, s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ItemRow({ item }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: '#fff', padding: '0.6rem', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid #f0f0f0' }}>
      <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.name}</p>
        <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0ea5e9', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>{item.source}</span>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>x{item.qty}</p>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0ea5e9', margin: 0 }}>{item.price}</p>
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem' }}>
      <span style={{ fontSize: '0.75rem', color: '#999', minWidth: '72px' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
