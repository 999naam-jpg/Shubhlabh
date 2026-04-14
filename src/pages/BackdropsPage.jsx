import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import styles from './BackdropsPage.module.css'

export default function BackdropsPage() {
  const [backdrops, setBackdrops] = useState([])
  const [cutouts, setCutouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const { addToCart, cart, updateQty, removeFromCart } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    Promise.all([api.getBackdrops(), api.getCutouts()])
      .then(([b, c]) => {
        setBackdrops(b.map(i => ({ ...i, _source: 'Backdrop' })))
        setCutouts(c.map(i => ({ ...i, _source: 'Cutout' })))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const allItems = [...backdrops, ...cutouts]
  const filtered = filter === 'All' ? allItems
    : filter === 'Backdrop' ? backdrops
    : cutouts

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.badge}>🖼️ Backdrops & Cutouts</span>
          <h1>Backdrops & Cutouts</h1>
          <p>Transform any venue with our premium backdrop walls and life-size cutouts.</p>
          <Link to="/cutouts" className={styles.switchBtn}>View Cutouts Only →</Link>
        </div>
      </section>

      <section className={styles.section}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div>
        ) : (
          <div className={styles.grid}>
            {allItems.map(item => {
              const id = item._id
              const source = item._source
              const unavailable = item.stock === 'Unavailable'
              const inCart = cart.find(i => i.id === id && i.source === source)
              return (
                <div key={id} className={`${styles.card} ${unavailable ? styles.disabled : ''}`} onClick={() => setModal(item)}>
                  <div className={styles.imgWrap}>
                    <img src={item.image} alt={item.name} />
                    {unavailable && <div className={styles.oos}>Out of Stock</div>}
                    {item.stock === 'Low Stock' && <div className={styles.low}>Low Stock</div>}
                    {item.trending && !unavailable && <div className={styles.trend}>🔥 Trending</div>}
                    <span className={styles.typeBadge}>{source === 'Backdrop' ? '🖼️' : '✂️'}</span>
                  </div>
                  <div className={styles.body}>
                    <h3>{item.name}</h3>
                    {item.desc && <p>{item.desc}</p>}
                    <div className={styles.meta}><strong>{item.price}</strong></div>
                    {unavailable ? (
                      <div className={styles.oosBtn}>Out of Stock</div>
                    ) : inCart ? (
                      <div className={styles.qty} onClick={e => e.stopPropagation()}>
                        <button onClick={() => inCart.qty === 1 ? removeFromCart(id, source) : updateQty(id, source, inCart.qty - 1)}>−</button>
                        <span>{inCart.qty}</span>
                        <button onClick={() => updateQty(id, source, inCart.qty + 1)}>+</button>
                      </div>
                    ) : (
                      <button className={styles.addBtn} onClick={e => {
                        e.stopPropagation()
                        addToCart({ ...item, id, source }, 1)
                        showToast(`${item.name} added!`)
                      }}>🛒 Add to Cart</button>
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
              <div className={styles.modalMeta}><strong>{modal.price}</strong></div>
              {modal.stock !== 'Unavailable' && (
                <button className={styles.addBtn} onClick={() => {
                  addToCart({ ...modal, id: modal._id, source: modal._source }, 1)
                  showToast(`${modal.name} added!`)
                  setModal(null)
                }}>🛒 Add to Cart</button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
