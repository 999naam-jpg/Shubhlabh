import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import styles from './Products.module.css'
import { api } from '../api'
import PhotoCarousel from '../components/PhotoCarousel'

function ProductModal({ p, onClose, addToCart, showToast, cart, updateQty, removeFromCart }) {
  const unavailable = p.stock === 'Unavailable'
  const inCart = cart.find(i => i.id === p._id && i.source === 'Product')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleAdd = () => {
    addToCart({ ...p, id: p._id, source: 'Product' }, 1)
    showToast(`${p.name} added to cart!`, 'success', p)
    onClose()
  }

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose}>✕</button>

        {/* Photos */}
        {p.photos?.length > 0
          ? <PhotoCarousel photos={p.photos} />
          : p.image && <img src={p.image} alt={p.name} className={styles.modalImg} />
        }

        <div className={styles.modalBody}>
          <div className={styles.modalTop}>
            <div>
              <span className={styles.category}>{p.category}</span>
              <h2 className={styles.modalTitle}>{p.name}</h2>
            </div>
            <div className={styles.modalPrice}>{p.price}</div>
          </div>

          {p.desc && <p className={styles.modalDesc}>{p.desc}</p>}

          {/* Stock badge */}
          <div className={styles.modalStock}>
            <span style={{
              background: p.stock === 'Available' ? '#dcfce7' : p.stock === 'Low Stock' ? '#fef3c7' : '#fee2e2',
              color: p.stock === 'Available' ? '#16a34a' : p.stock === 'Low Stock' ? '#d97706' : '#dc2626',
              padding: '0.25rem 0.8rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700
            }}>{p.stock}</span>
            {p.quantity > 0 && <span className={styles.modalQty}>Qty: {p.quantity}</span>}
          </div>

          {/* Included items */}
          {p.includedProducts?.length > 0 && (
            <div className={styles.modalIncluded}>
              <h4>📦 What's Included</h4>
              <div className={styles.includedGrid}>
                {p.includedProducts.map((item, i) => (
                  <div key={i} className={styles.includedItem}>
                    {item.image && <img src={item.image} alt={item.name} />}
                    <div>
                      <p>{item.name || item}</p>
                      {item._type && <span>{item._type}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className={styles.modalActions}>
            {unavailable ? (
              <span className={styles.outOfStockBtn}>Out of Stock</span>
            ) : inCart ? (
              <div className={styles.modalCartControl}>
                <button onClick={() => inCart.qty === 1 ? removeFromCart(p._id, 'Product') : updateQty(p._id, 'Product', inCart.qty - 1)}>−</button>
                <span>🛒 {inCart.qty} in cart</span>
                <button onClick={() => updateQty(p._id, 'Product', inCart.qty + 1)}>+</button>
              </div>
            ) : (
              <button className={styles.modalAddBtn} onClick={handleAdd}>🛒 Add to Cart</button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function ProductCard({ p, onOpen, cart }) {
  const unavailable = p.stock === 'Unavailable'
  const inCart = cart.find(i => i.id === p._id && i.source === 'Product')
  return (
    <div className={`${styles.card} ${unavailable ? styles.cardDisabled : ''}`} onClick={() => onOpen(p)}>
      {p.photos?.length > 0
        ? <div className={styles.decoCarousel}><PhotoCarousel photos={p.photos} /></div>
        : <div className={styles.imgWrap}>
            <img src={p.image} alt={p.name} />
            {unavailable && <div className={styles.outOfStock}>Out of Stock</div>}
            {p.stock === 'Low Stock' && <div className={styles.lowStock}>Low Stock</div>}
            {p.trending && !unavailable && <div className={styles.trending}>🔥 Trending</div>}
          </div>
      }
      <div className={styles.body}>
        <span className={styles.category}>{p.category}</span>
        <h3>{p.name}</h3>
        {p.desc && <p className={styles.desc}>{p.desc}</p>}
        {p.includedProducts?.length > 0 && (
          <p className={styles.includedHint}>📦 {p.includedProducts.length} items included</p>
        )}
        <div className={styles.footer}>
          <strong>{p.price}</strong>
          <span className={styles.viewBtn}>
            View Details →
            {inCart && <span className={styles.cartQtyBadge}>{inCart.qty}</span>}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const [active, setActive] = useState('All')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { addToCart, cart, updateQty, removeFromCart } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods.map(d => ({ ...d, _id: d._id })))
        setCategories([...new Set(cats.map(c => c.name))])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const allCats = ['All', ...categories]
  const filtered = active === 'All' ? products : products.filter(p => p.category === active)

  return (
    <main>
      <section className={styles.hero}>
        <h1>Our Rental Products</h1>
        <p>Browse our full catalog and find everything you need for your event</p>
      </section>

      <section className={styles.section}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div>
        ) : (
          <>
            <div className={styles.filters}>
              {allCats.map(c => (
                <button key={c}
                  className={`${styles.filter} ${active === c ? styles.filterActive : ''}`}
                  onClick={() => setActive(c)}>{c}</button>
              ))}
            </div>
            <div className={styles.grid}>
              {filtered.map(p => (
                <ProductCard key={p._id} p={p} onOpen={setSelected} cart={cart} />
              ))}
            </div>
          </>
        )}
      </section>

      {selected && (
        <ProductModal
          p={selected}
          onClose={() => setSelected(null)}
          addToCart={addToCart}
          showToast={showToast}
          cart={cart}
          updateQty={updateQty}
          removeFromCart={removeFromCart}
        />
      )}
    </main>
  )
}
