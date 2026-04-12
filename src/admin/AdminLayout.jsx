import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../api'
import styles from './AdminLayout.module.css'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/calendar', label: 'Confirmed Order', icon: '📅' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/products', label: 'Products', icon: '🛍️' },
  { to: '/admin/backdrops', label: 'Backdrops', icon: '🖼️' },
  { to: '/admin/cutouts', label: 'Cutouts', icon: '✂️' },
  { to: '/admin/other-products', label: 'Other Products', icon: '📦' },
  { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUnread = () => {
      api.getInquiries()
        .then(data => setUnreadCount(data.filter(i => !i.read).length))
        .catch(() => {})
    }
    fetchUnread()
    // Poll every 30 seconds for new inquiries
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`${styles.shell} adminShell`}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarTop}>
          <span className={styles.brand}>{collapsed ? '🌸' : '🌸 Admin Panel'}</span>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className={styles.sideNav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* Inquiries — last with notification badge */}
          <NavLink
            to="/admin/inquiries"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
            style={{ marginTop: 'auto' }}
          >
            <span className={styles.navIcon} style={{ position: 'relative' }}>
              📩
              {unreadCount > 0 && (
                <span className={styles.notifBadge}>{unreadCount}</span>
              )}
            </span>
            {!collapsed && (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                Inquiries
                {unreadCount > 0 && (
                  <span className={styles.notifPill}>{unreadCount} new</span>
                )}
              </span>
            )}
          </NavLink>
        </nav>

        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <span>🌐</span>
          {!collapsed && <span>View Site</span>}
        </button>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>Shubh Labh Event Admin</h1>
          <div className={styles.topbarRight}>
            {unreadCount > 0 && (
              <NavLink to="/admin/inquiries" className={styles.topbarNotif}>
                📩 {unreadCount} new {unreadCount === 1 ? 'inquiry' : 'inquiries'}
              </NavLink>
            )}
            <button className={styles.viewSiteBtn} onClick={() => navigate('/')}>
              🌐 View Site
            </button>
            <span className={styles.adminBadge}>👤 Admin</span>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
