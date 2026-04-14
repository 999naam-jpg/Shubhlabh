import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import styles from './CutoutsPage.module.css'

const ADMIN_EMAIL = 'monilkumbhani@gmail.com'

export default function CutoutsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const { addToCart, cart, updateQty, removeFromCart } = useCart()
  const { showToast } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    api.getCutouts()
      .then(data => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.badge}>✂️ Life-Size Cutouts</span>
          <h1>Fun Cutouts & Props</h1>
          <p>Add personality to your event with life-size standees, number cutouts, letter props and photo booth frames.</p>
          <Link to="/backdrops" className={styles.switchBtn}>← Looking for Backdrops?</Link>
        </div>
      </section>

      <section className={styles.section}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => {
              const unavailable = item.stock === 'Unavailable'
              const inCart = cart.find(i => i.id === item._id && i.source === 'Cutout')
              return (
                <div key={item._id} className={`${styles.card} ${unavailable ? styles.disabled : ''}`} onClick={() => setModal(item)}>
                  <div className={styles.imgWrap}>
                    <img src={item.image} alt={item.name} />
                    {unavailable && <div className={styles.oos}>Out of Stock</div>}
                    {item.stock === 'Low Stock' && <div className={styles.low}>Low Stock</div>}
                    {item.trending && !unavailable && <div className={styles.trend}>🔥 Trending</div>}
                    {isAdmin && item.quantity !== undefined && (
                      <span style={{ position:'absolute', bottom:'0.5rem', right:'0.5rem', background:'#0ea5e9', color:'#fff', fontSize:'0.82rem', fontWeight:800, padding:'0.3rem 0.8rem', borderRadius:'999px', boxShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>
                        📦 {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className={styles.body}>
                    <h3>{item.name}</h3>
                    {item.desc && <p>{item.desc}</p>}
                    <div className={styles.meta}>
                      <strong>{item.price}</strong>
                    </div>
                    {unavailable ? (
                      <div className={styles.oosBtn}>Out of Stock</div>
                    ) : inCart ? (
                      <div className={styles.qty} onClick={e => e.stopPropagation()}>
                        <button onClick={() => inCart.qty === 1 ? removeFromCart(item._id, 'Cutout') : updateQty(item._id, 'Cutout', inCart.qty - 1)}>−</button>
                        <span>{inCart.qty}</span>
                        <button onClick={() => updateQty(item._id, 'Cutout', inCart.qty + 1)}>+</button>
                      </div>
                    ) : (
                      <button className={styles.addBtn} onClick={e => { e.stopPropagation(); addToCart({ ...item, id: item._id, source: 'Cutout' }, 1); showToast(`${item.name} added!`) }}>
                        🛒 Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setModal(null)}>✕</button>
            <img src={modal.image} alt={modal.name} />
            <div className={styles.modalBody}>
              <h2>{modal.name}</h2>
              {modal.desc && <p>{modal.desc}</p>}
              <div className={styles.modalMeta}>
                <strong>{modal.price}</strong>
              </div>
              {modal.stock !== 'Unavailable' && (
                <button className={styles.addBtn} onClick={() => { addToCart({ ...modal, id: modal._id, source: 'Cutout' }); showToast(`${modal.name} added!`); setModal(null) }}>
                  🛒 Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
