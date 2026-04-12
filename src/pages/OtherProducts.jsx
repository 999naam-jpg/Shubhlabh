import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api'
import PhotoCarousel from '../components/PhotoCarousel'
import styles from './Products.module.css'

export default function OtherProducts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { addToCart, cart, updateQty, removeFromCart } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    fetch('http://localhost:5000/api/other-products')
      .then(r => r.json())
      .then(data => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main>
      <section className={styles.hero}>
        <h1>Other Products</h1>
        <p>More items available for your event</p>
      </section>
      <section className={styles.section}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 360, padding: '0.65rem 1rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.92rem', outline: 'none', marginBottom: '1.5rem', display: 'block' }}
        />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>No products found.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(p => {
              const unavailable = p.stock === 'Unavailable'
              const inCart = cart.find(i => i.id === p._id && i.source === 'OtherProduct')
              return (
                <div key={p._id} className={`${styles.card} ${unavailable ? styles.cardDisabled : ''}`}>
                  {p.photos?.length > 0
                    ? <div style={{ borderRadius: '12px 12px 0 0', overflow: 'hidden' }}><PhotoCarousel photos={p.photos} /></div>
                    : <div className={styles.imgWrap}><img src={p.image} alt={p.name} />
                        {unavailable && <div className={styles.outOfStock}>Out of Stock</div>}
                        {p.stock === 'Low Stock' && <div className={styles.lowStock}>Low Stock</div>}
                        {p.trending && !unavailable && <div className={styles.trending}>🔥 Trending</div>}
                      </div>
                  }
                  <div className={styles.body}>
                    <h3>{p.name}</h3>
                    {p.desc && <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>{p.desc}</p>}
                    <div className={styles.footer}>
                      <strong>{p.price}</strong>
                      {unavailable ? (
                        <span className={styles.outOfStockBtn}>Out of Stock</span>
                      ) : inCart ? (
                        <div className={styles.qtyControl}>
                          <button onClick={() => inCart.qty === 1 ? removeFromCart(p._id, 'OtherProduct') : updateQty(p._id, 'OtherProduct', inCart.qty - 1)}>−</button>
                          <span>{inCart.qty}</span>
                          <button onClick={() => updateQty(p._id, 'OtherProduct', inCart.qty + 1)}>+</button>
                        </div>
                      ) : (
                        <button className={styles.btn} onClick={() => { addToCart({ ...p, id: p._id, source: 'OtherProduct' }, 1); showToast(`${p.name} added!`) }}>
                          + Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
