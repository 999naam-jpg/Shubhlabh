import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import styles from './BackdropsPage.module.css'

export default function BackdropsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const { addToCart, cart, updateQty, removeFromCart } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    api.getBackdrops()
      .then(data => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.badge}>🖼️ Backdrop Walls</span>
          <h1>Stunning Backdrops</h1>
          <p>Transform any venue with our premium backdrop walls — perfect for ceremonies, receptions and photo booths.</p>
          <Link to="/cutouts" className={styles.switchBtn}>Looking for Cutouts? →</Link>
        </div>
      </section>

      <section className={styles.section}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => {
              const unavailable = item.stock === 'Unavailable'
              const inCart = cart.find(i => i.id === item.id && i.source === 'Backdrop')
              return (
                <div key={item.id} className={`${styles.card} ${unavailable ? styles.disabled : ''}`} onClick={() => setModal(item)}>
                  <div className={styles.imgWrap}>
                    <img src={item.image} alt={item.name} />
                    {unavailable && <div className={styles.oos}>Out of Stock</div>}
                    {item.stock === 'Low Stock' && <div className={styles.low}>Low Stock</div>}
                    {item.trending && !unavailable && <div className={styles.trend}>🔥 Trending</div>}
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
                        <button onClick={() => inCart.qty === 1 ? removeFromCart(item.id, 'Backdrop') : updateQty(item.id, 'Backdrop', inCart.qty - 1)}>−</button>
                        <span>{inCart.qty}</span>
                        <button onClick={() => updateQty(item.id, 'Backdrop', inCart.qty + 1)}>+</button>
                      </div>
                    ) : (
                      <button className={styles.addBtn} onClick={e => { e.stopPropagation(); addToCart({ ...item, source: 'Backdrop' }, 1); showToast(`${item.name} added!`) }}>
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
                <button className={styles.addBtn} onClick={() => { addToCart({ ...modal, source: 'Backdrop' }); showToast(`${modal.name} added!`); setModal(null) }}>
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
