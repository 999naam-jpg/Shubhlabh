import { useState, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { StatusBadge } from './Dashboard'
import BabyBadge from './BabyBadge'
import { generateInvoice, sendInvoiceWhatsApp } from '../utils/generateInvoice'
import styles from './AdminCalendar.module.css'

export default function AdminCalendar() {
  const { orders, markOrderDone, markPickupDone } = useCart()
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [search, setSearch] = useState('')
  const [showPast, setShowPast] = useState(false)
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const timelineRef = useRef(null)

  const toggleOrder = (id) => setExpandedOrder(prev => prev === id ? null : id)
  const todayStr = new Date().toISOString().split('T')[0]

  const completedOrders = orders.filter(o => o.orderDone && o.pickupDone)
  const activeOrders = orders.filter(o => !(o.orderDone && o.pickupDone))

  // Group active orders by event date
  const grouped = {}
  activeOrders.forEach(order => {
    const key = order.customer?.date
    if (!key) return
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(order)
  })

  const sortedDates = Object.keys(grouped).sort()
  const upcomingDates = sortedDates.filter(d => d >= todayStr)

  // Filter by search + selected date
  const filtered = sortedDates.filter(date => {
    if (selectedDate && date !== selectedDate) return false
    if (!search) return true
    return grouped[date].some(o =>
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase())
    )
  })

  // ── Mini Calendar ──────────────────────────────────────────
  const { year, month } = calMonth
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonth = () => setCalMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 })
  const nextMonth = () => setCalMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 })

  const calCells = []
  for (let i = 0; i < firstDay; i++) calCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d)

  const dateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const handleDayClick = (d) => {
    const ds = dateStr(d)
    if (selectedDate === ds) {
      setSelectedDate(null)
    } else {
      setSelectedDate(ds)
      setTimeout(() => timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  const monthName = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div className={styles.topRow}>
        <div>
          <h2 className={styles.heading}>📅 Confirmed Orders Calendar</h2>
          <p className={styles.sub}>View confirmed orders grouped by date</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}><strong>{orders.length}</strong><span>Total</span></div>
          <div className={styles.stat}><strong>{upcomingDates.length}</strong><span>Upcoming</span></div>
          <div className={styles.stat}><strong>{activeOrders.filter(o => o.customer?.date === todayStr).length}</strong><span>Today</span></div>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className={styles.miniCal}>
        <div className={styles.miniCalHeader}>
          <button onClick={prevMonth}>‹</button>
          <span>{monthName}</span>
          <button onClick={nextMonth}>›</button>
        </div>
        <div className={styles.miniCalGrid}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className={styles.miniCalDayName}>{d}</div>
          ))}
          {calCells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />
            const ds = dateStr(d)
            const count = grouped[ds]?.length || 0
            const isToday = ds === todayStr
            const isSelected = ds === selectedDate
            const hasOrders = count > 0
            return (
              <div
                key={ds}
                className={`${styles.miniCalDay}
                  ${isToday ? styles.miniCalToday : ''}
                  ${isSelected ? styles.miniCalSelected : ''}
                  ${hasOrders ? styles.miniCalHasOrders : ''}
                `}
                onClick={() => hasOrders && handleDayClick(d)}
              >
                <span>{d}</span>
                {hasOrders && <span className={styles.miniCalDot}>{count}</span>}
              </div>
            )
          })}
        </div>
        {selectedDate && (
          <div className={styles.miniCalClear}>
            Showing: <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</strong>
            <button onClick={() => setSelectedDate(null)}>✕ Clear</button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="🔍 Search order or customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Timeline */}
      <div ref={timelineRef}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>No orders found.</div>
        ) : (
          <div className={styles.timeline}>
            {filtered.map(date => {
              const dayOrders = search
                ? grouped[date].filter(o =>
                    o.id?.toLowerCase().includes(search.toLowerCase()) ||
                    o.customer?.name?.toLowerCase().includes(search.toLowerCase())
                  )
                : grouped[date]

              if (dayOrders.length === 0) return null

              const isToday = date === todayStr
              const isPast  = date < todayStr
              const dateObj = new Date(date + 'T00:00:00')
              const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'long' })
              const dateFormatted = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

              return (
                <div key={date} className={`${styles.dateGroup} ${isToday ? styles.today : ''} ${isPast ? styles.past : ''}`}>
                  <div className={styles.dateHeader}>
                    <div className={styles.dateBadge}>
                      <span className={styles.dateDay}>{dateObj.getDate()}</span>
                      <span className={styles.dateMonth}>{dateObj.toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className={styles.dateInfo}>
                      <p className={styles.dateFull}>{dayName}, {dateFormatted}</p>
                      <span className={styles.dateCount}>{dayOrders.length} order{dayOrders.length !== 1 ? 's' : ''}</span>
                      {isToday && <span className={styles.todayBadge}>Today</span>}
                      {isPast  && <span className={styles.pastBadge}>Past</span>}
                    </div>
                    <div className={styles.dateTotalAmt}>
                      ₹{dayOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}
                    </div>
                  </div>

                  <div className={styles.orderList}>
                    {dayOrders.map(order => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        expanded={expandedOrder === order.id}
                        onToggle={() => toggleOrder(order.id)}
                        onOrderDone={() => markOrderDone(order._mongoId)}
                        onPickupDone={() => markPickupDone(order._mongoId)}
                        styles={styles}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Past / Completed Orders */}
      {completedOrders.length > 0 && (
        <div className={styles.pastSection}>
          <button className={styles.pastToggle} onClick={() => setShowPast(p => !p)}>
            🗂️ Past Orders ({completedOrders.length}) {showPast ? '▲' : '▼'}
          </button>

          {showPast && (() => {
            const pastGrouped = {}
            completedOrders.forEach(order => {
              const key = order.customer?.date
              if (!key) return
              if (!pastGrouped[key]) pastGrouped[key] = []
              pastGrouped[key].push(order)
            })
            const pastDates = Object.keys(pastGrouped).sort().reverse()
            const filteredPast = pastDates.filter(date => {
              if (!search) return true
              return pastGrouped[date].some(o =>
                o.id?.toLowerCase().includes(search.toLowerCase()) ||
                o.customer?.name?.toLowerCase().includes(search.toLowerCase())
              )
            })

            return (
              <div className={styles.timeline} style={{ marginTop: '0.75rem' }}>
                {filteredPast.map(date => {
                  const dayOrders = search
                    ? pastGrouped[date].filter(o =>
                        o.id?.toLowerCase().includes(search.toLowerCase()) ||
                        o.customer?.name?.toLowerCase().includes(search.toLowerCase())
                      )
                    : pastGrouped[date]
                  if (dayOrders.length === 0) return null
                  const dateObj = new Date(date + 'T00:00:00')
                  const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'long' })
                  const dateFormatted = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  return (
                    <div key={date} className={`${styles.dateGroup} ${styles.past}`}>
                      <div className={styles.dateHeader}>
                        <div className={styles.dateBadge}>
                          <span className={styles.dateDay}>{dateObj.getDate()}</span>
                          <span className={styles.dateMonth}>{dateObj.toLocaleDateString('en-IN', { month: 'short' })}</span>
                        </div>
                        <div className={styles.dateInfo}>
                          <p className={styles.dateFull}>{dayName}, {dateFormatted}</p>
                          <span className={styles.dateCount}>{dayOrders.length} order{dayOrders.length !== 1 ? 's' : ''}</span>
                          <span className={styles.pastBadge}>Completed</span>
                        </div>
                        <div className={styles.dateTotalAmt}>
                          ₹{dayOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.orderList}>
                        {dayOrders.map(order => (
                          <OrderRow
                            key={order.id}
                            order={order}
                            expanded={expandedOrder === order.id}
                            onToggle={() => toggleOrder(order.id)}
                            styles={styles}
                            completed
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

function OrderRow({ order, expanded, onToggle, onOrderDone, onPickupDone, styles, completed }) {
  return (
    <div>
      <div className={`${styles.orderRow} ${expanded ? styles.orderRowActive : ''}`} onClick={onToggle}>
        <div className={styles.orderLeft}>
          <p className={styles.orderId}>{order.id}</p>
          <p className={styles.customerName}>{order.customer?.name}</p>
          <p className={styles.customerPhone}>{order.customer?.phone}</p>
        </div>
        <div className={styles.orderMid}>
          <div className={styles.itemThumbs}>
            {order.items?.slice(0, 3).map((item, i) => (
              <img key={i} src={item.image} alt={item.name} style={{ zIndex: 10 - i, marginLeft: i > 0 ? '-8px' : 0 }} />
            ))}
            {order.items?.length > 3 && <span>+{order.items.length - 3}</span>}
          </div>
          <p className={styles.itemCount}>{order.items?.reduce((s, i) => s + i.qty, 0)} item(s)</p>
        </div>
        <div className={styles.orderRight}>
          <StatusBadge status={order.status} />
          <p className={styles.orderTotal}>₹{order.total?.toLocaleString()}</p>
          {order.balance > 0 && <p className={styles.orderBalance}>Due: ₹{order.balance?.toLocaleString()}</p>}
          {completed && <span className={styles.completedBadge}>🎉 Completed</span>}
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
        {(order.orderDone || order.pickupDone) && !completed && (
          <div className={styles.stepRow}>
            <span className={`${styles.stepPill} ${order.orderDone ? styles.stepDone : ''}`}>✅ Order Done</span>
            <span className={styles.stepArrow}>→</span>
            <span className={`${styles.stepPill} ${order.pickupDone ? styles.stepDone : styles.stepPending}`}>📦 Pickup Done</span>
          </div>
        )}
      </div>

      {expanded && (
        <div className={styles.detail}>
          <div className={styles.detailGrid}>
            <div className={styles.detailSection}>
              <h5>🛍️ Items</h5>
              {order.items?.map((item, i) => (
                <div key={i} className={styles.detailItem}>
                  <img src={item.image} alt={item.name} />
                  <div><p>{item.name}</p><span>{item.source}</span></div>
                  <div className={styles.detailItemRight}><span>×{item.qty}</span><strong>{item.price}</strong></div>
                </div>
              ))}
            </div>
            <div className={styles.detailSection}>
              <h5>👤 Customer</h5>
              <div className={styles.infoRows}>
                <InfoRow label="Name"  value={order.customer?.name} styles={styles} />
                <InfoRow label="Phone" value={order.customer?.phone} styles={styles} />
                {order.customer?.email       && <InfoRow label="Email"  value={order.customer.email} styles={styles} />}
                {order.customer?.date        && <InfoRow label="Event"  value={order.customer.date} styles={styles} />}
                {order.customer?.pickupDate  && <InfoRow label="Pickup" value={order.customer.pickupDate} styles={styles} />}
                {order.customer?.returnDate  && <InfoRow label="Return" value={order.customer.returnDate} styles={styles} />}
                {order.customer?.address     && <InfoRow label="Venue"  value={order.customer.address} styles={styles} />}
                {order.customer?.homeAddress && <InfoRow label="Home"   value={order.customer.homeAddress} styles={styles} />}
                {order.customer?.babyGender  && <InfoRow label="👶 Baby" value={<BabyBadge gender={order.customer.babyGender} />} styles={styles} />}
                {order.customer?.note        && <InfoRow label="Notes"  value={order.customer.note} styles={styles} />}
              </div>
              <h5 style={{ marginTop: '1rem' }}>💳 Payment</h5>
              <div className={styles.payBox}>
                <div className={styles.payRow}><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
                {order.discount > 0 && <div className={styles.payRow} style={{ color: '#d97706' }}><span>Discount</span><span>−₹{order.discount?.toLocaleString()}</span></div>}
                {order.deposit  > 0 && <div className={styles.payRow} style={{ color: '#16a34a' }}><span>Deposit</span><span>−₹{order.deposit?.toLocaleString()}</span></div>}
                <div className={styles.payTotal}><span>Balance Due</span><strong>₹{Math.max(0, order.balance ?? order.total)?.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
          <div className={styles.detailActions}>
            <button className={styles.invoiceBtn} onClick={() => generateInvoice(order)}>📄 Invoice</button>
            <button className={styles.waBtn} onClick={() => sendInvoiceWhatsApp(order)}>💬 WhatsApp</button>
            {!completed && !order.orderDone && !order.pickupDone && (
              <button className={styles.doneBtn} onClick={onOrderDone}>✅ Order Done</button>
            )}
            {!completed && order.orderDone && !order.pickupDone && (
              <button className={styles.pickupBtn} onClick={onPickupDone}>📦 Pickup Done</button>
            )}
            {(completed || (order.orderDone && order.pickupDone)) && (
              <span className={styles.completedBadge}>🎉 Completed</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, styles }) {
  return (
    <div className={styles.infoRow}>
      <span>{label}</span>
      <p>{value}</p>
    </div>
  )
}
