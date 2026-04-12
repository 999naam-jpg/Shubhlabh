import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import styles from './Navbar.module.css'

const links = [
  { label: 'Home', to: '/', icon: '🏠' },
  { label: 'Decoration', to: '/products', icon: '🎨' },
  { label: 'Backdrops', to: '/backdrops', icon: '🖼️' },
  { label: 'Cutouts', to: '/cutouts', icon: '✂️' },
  { label: 'Extra Items', to: '/other-products', icon: '📦' },
  { label: 'Contact', to: '/contact', icon: '📞' },
]

export default function Navbar() {
  const [dropOpen, setDropOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    showToast('You have been signed out. See you soon! 👋', 'error')
    navigate('/')
    setDropOpen(false)
  }

  return (
    <>
      {/* Top Navbar */}
      <nav className={styles.nav}>
        <div className={styles.inner}>

          {/* Logo */}
          <NavLink to="/" className={styles.logo}>
            <img src="/551402660_17843895663577377_7895316719802754113_n.jpg" alt="Shubh Labh Event" className={styles.logoImg} />
            <span>Shubh Labh Event</span>
          </NavLink>

          {/* Desktop links */}
          <ul className={styles.links}>
            {links.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => isActive ? styles.active : ''}
                >{link.label}</NavLink>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className={styles.right}>
            <Link to="/orders" className={styles.iconBtn} title="My Orders">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </Link>

            <Link to="/cart" className={styles.iconBtn} title="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
            </Link>

            {user?.email === 'monilkumbhani@gmail.com' && (
              <Link to="/admin" className={styles.iconBtn} title="Admin Panel">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </Link>
            )}

            <div className={styles.divider} />

            {user ? (
              <div className={styles.userMenu}>
                <div className={styles.avatarWrap} onClick={() => setDropOpen(!dropOpen)}>
                  {user.photoURL
                    ? <img src={user.photoURL} alt={user.displayName} className={styles.avatar} referrerPolicy="no-referrer" />
                    : <div className={styles.avatarFallback}>{(user.displayName || user.email || '?')[0].toUpperCase()}</div>
                  }
                </div>
                {dropOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropUser}>
                      {user.photoURL
                        ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                        : <div className={styles.avatarFallback} style={{ width: 36, height: 36, fontSize: '1rem' }}>{(user.displayName || user.email || '?')[0].toUpperCase()}</div>
                      }
                      <div>
                        <p>{user.displayName}</p>
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <Link to="/orders" className={styles.dropItem} onClick={() => setDropOpen(false)}>📦 My Orders</Link>
                    <button className={styles.dropLogout} onClick={handleLogout}>🚪 Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn}>Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Tab Menu */}
      <nav className={styles.bottomNav}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `${styles.bottomItem} ${isActive ? styles.bottomActive : ''}`}
          >
            <span className={styles.bottomIcon}>{link.icon}</span>
            <span className={styles.bottomLabel}>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
