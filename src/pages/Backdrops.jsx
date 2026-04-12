import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import styles from './Backdrops.module.css'

const items = [
  { id: 1,  name: 'Floral Backdrop',          type: 'Backdrop', size: '8ft x 8ft',  price: '₹2500/day',   stock: 'Available',   trending: true,  image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80', desc: 'Lush artificial flower wall backdrop, perfect for wedding ceremonies and photo booths.', colors: ['Pink', 'White', 'Red', 'Mixed'] },
  { id: 2,  name: 'Sequin Shimmer Backdrop',  type: 'Backdrop', size: '8ft x 8ft',  price: '₹1800/day',   stock: 'Available',   trending: true,  image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80', desc: 'Glittery sequin panel backdrop that catches light beautifully for parties.', colors: ['Gold', 'Silver', 'Rose Gold', 'Black'] },
  { id: 3,  name: 'Balloon Arch Backdrop',    type: 'Backdrop', size: '7ft x 7ft',  price: '₹2000/day',   stock: 'Unavailable', trending: false, image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80', desc: 'Colorful balloon arch frame backdrop, great for birthdays and baby showers.', colors: ['Custom Colors'] },
  { id: 4,  name: 'Fairy Light Curtain',      type: 'Backdrop', size: '10ft x 8ft', price: '₹1500/day',   stock: 'Available',   trending: false, image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=500&q=80', desc: 'Warm white LED fairy light curtain backdrop for a dreamy, romantic atmosphere.', colors: ['Warm White', 'Cool White', 'Multicolor'] },
  { id: 9,  name: 'Rustic Wooden Backdrop',   type: 'Backdrop', size: '8ft x 6ft',  price: '₹2200/day',   stock: 'Available',   trending: false, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500&q=80', desc: 'Elegant rustic wooden panel backdrop ideal for boho and outdoor themed events.', colors: ['Natural Wood', 'White Wash'] },
  { id: 10, name: 'Neon Sign Backdrop',       type: 'Backdrop', size: '5ft x 3ft',  price: '₹3000/day',   stock: 'Unavailable', trending: false, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80', desc: 'Custom LED neon sign backdrop with your name or message.', colors: ['Pink', 'Blue', 'White', 'Custom'] },
  { id: 12, name: 'Geometric Frame Backdrop', type: 'Backdrop', size: '7ft x 7ft',  price: '₹1600/day',   stock: 'Available',   trending: true,  image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&q=80', desc: 'Modern geometric metal frame backdrop, customizable with drapes, flowers, or balloons.', colors: ['Gold', 'Black', 'Silver'] },
  { id: 5,  name: 'Bride & Groom Cutout',     type: 'Cutout',   size: '5ft tall',   price: '₹800/day',    stock: 'Available',   trending: true,  image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&q=80', desc: 'Life-size standee cutout of a bride and groom silhouette for wedding photo ops.', colors: ['White', 'Gold Outline'] },
  { id: 6,  name: 'Number Cutouts (0–9)',     type: 'Cutout',   size: '4ft tall',   price: '₹500/number', stock: 'Available',   trending: false, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&q=80', desc: 'Large foam number cutouts for milestone birthdays, anniversaries, and new year events.', colors: ['Gold', 'Silver', 'White', 'Black'] },
  { id: 7,  name: 'Letter Name Cutouts',      type: 'Cutout',   size: '3ft tall',   price: '₹400/letter', stock: 'Low Stock',   trending: false, image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&q=80', desc: 'Custom alphabet letter cutouts to spell names or words at your event.', colors: ['Gold', 'Silver', 'Rose Gold', 'White'] },
  { id: 8,  name: 'Photo Booth Frame',        type: 'Cutout',   size: '6ft x 4ft',  price: '₹1200/day',   stock: 'Available',   trending: true,  image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&q=80', desc: 'Decorative oversized photo frame prop for fun photo booth setups at any event.', colors: ['Gold', 'White', 'Black'] },
  { id: 11, name: 'Cartoon Character Cutout', type: 'Cutout',   size: '4ft tall',   price: '₹600/day',    stock: 'Available',   trending: false, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80', desc: 'Fun life-size cartoon character standees for kids birthday parties.', colors: ['Full Color Print'] },
]

const backdrops = items.filter(i => i.type === 'Backdrop')
const cutouts   = items.filter(i => i.type === 'Cutout')

export default function Backdrops() {
  const [modal, setModal] = useState(null)
  const { addToCart, cart, updateQty, removeFromCart } = useCart()
  const { showToast } = useToast()

  const cardProps = { onView: setModal, addToCart, showToast, cart, updateQty, removeFromCart }

  return (
    <main>

      {/* ── BACKDROPS SECTION ── */}
      <section id="backdrops" className={styles.backdropHero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>🖼️ Backdrop Walls</span>
          <h1>Stunning Backdrops</h1>
          <p>Transform any venue with our premium backdrop walls — perfect for ceremonies, receptions and photo booths.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.grid}>
          {backdrops.map(item => (
            <ItemCard key={item.id} item={item} theme="backdrop" {...cardProps} />
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className={styles.divider}>
        <span>✂️ Cutouts & Props</span>
      </div>

      {/* ── CUTOUTS SECTION ── */}
      <section id="cutouts" className={styles.cutoutHero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>✂️ Life-Size Cutouts</span>
          <h1>Fun Cutouts & Props</h1>
          <p>Add personality to your event with life-size standees, number cutouts, letter props and photo booth frames.</p>
        </div>

        <div className={styles.cutoutGrid}>
          {cutouts.map(item => (
            <ItemCard key={item.id} item={item} theme="cutout" {...cardProps} />
          ))}
        </div>
      </section>

      {/* ── CUSTOM BANNER ── */}
      <section className={styles.customBanner}>
        <h2>Need Something Custom?</h2>
        <p>We create fully custom backdrops and cutouts tailored to your theme, colors and size.</p>
        <Link to="/contact" className={styles.customBtn}>Request Custom Order →</Link>
      </section>

      {/* ── MODAL ── */}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setModal(null)}>✕</button>
            <img src={modal.image.replace('w=500', 'w=800')} alt={modal.name} />
            <div className={styles.modalBody}>
              <span className={`${styles.typeBadge} ${modal.type === 'Cutout' ? styles.cutoutBadge : ''}`}>{modal.type}</span>
              <h2>{modal.name}</h2>
              <p>{modal.desc}</p>
              <div className={styles.modalMeta}>
                <div><span>📐 Size</span><strong>{modal.size}</strong></div>
                <div><span>💰 Price</span><strong>{modal.price}</strong></div>
              </div>
              <div className={styles.modalColors}>
                <p>Available Colors:</p>
                <div>{modal.colors.map(c => <span key={c} className={styles.color}>{c}</span>)}</div>
              </div>
              {modal.stock === 'Unavailable' ? (
                <div className={styles.outOfStockBtn}>Out of Stock</div>
              ) : (
                <button className={styles.modalCartBtn}
                  onClick={() => { addToCart({ ...modal, source: 'Backdrop/Cutout' }); showToast(`${modal.name} added to cart!`); setModal(null) }}>
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

function ItemCard({ item, theme, onView, addToCart, showToast, cart, updateQty, removeFromCart }) {
  const unavailable = item.stock === 'Unavailable'
  const inCart = cart.find(i => i.id === item.id && i.source === 'Backdrop/Cutout')
  const isCutout = theme === 'cutout'

  return (
    <div className={`${styles.card} ${isCutout ? styles.cutoutCard : ''} ${unavailable ? styles.cardDisabled : ''}`}
      onClick={() => onView(item)}>
      <div className={styles.imgWrap}>
        <img src={item.image} alt={item.name} />
        <span className={`${styles.typeBadge} ${isCutout ? styles.cutoutBadge : ''}`}>{item.type}</span>
        {unavailable && <div className={styles.outOfStockOverlay}>Out of Stock</div>}
        {item.stock === 'Low Stock' && !unavailable && <div className={styles.lowStockBadge}>Low Stock</div>}
        {item.trending && !unavailable && <div className={styles.trendingBadge}>🔥 Trending</div>}
      </div>
      <div className={styles.body}>
        <h3>{item.name}</h3>
        <p>{item.desc}</p>
        <div className={styles.meta}>
          <span>📐 {item.size}</span>
          <strong className={isCutout ? styles.cutoutPrice : ''}>{item.price}</strong>
        </div>
        <div className={styles.colors}>
          {item.colors.map(c => <span key={c} className={`${styles.color} ${isCutout ? styles.cutoutColor : ''}`}>{c}</span>)}
        </div>
        <button className={`${styles.enquireBtn} ${isCutout ? styles.cutoutEnquireBtn : ''}`}
          onClick={e => { e.stopPropagation(); onView(item) }}>View Details</button>
        {unavailable ? (
          <div className={styles.outOfStockBtn}>Out of Stock</div>
        ) : inCart ? (
          <div className={`${styles.qtyControl} ${isCutout ? styles.cutoutQty : ''}`} onClick={e => e.stopPropagation()}>
            <button onClick={() => inCart.qty === 1 ? removeFromCart(item.id, 'Backdrop/Cutout') : updateQty(item.id, 'Backdrop/Cutout', inCart.qty - 1)}>−</button>
            <span>{inCart.qty}</span>
            <button onClick={() => updateQty(item.id, 'Backdrop/Cutout', inCart.qty + 1)}>+</button>
          </div>
        ) : (
          <button className={`${styles.cartBtn} ${isCutout ? styles.cutoutCartBtn : ''}`}
            onClick={e => { e.stopPropagation(); addToCart({ ...item, source: 'Backdrop/Cutout' }, 1); showToast(`${item.name} added to cart!`) }}>
            🛒 Add to Cart
          </button>
        )}
      </div>
    </div>
  )
}
