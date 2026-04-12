import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useReviews } from '../context/ReviewContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api'
import styles from './Home.module.css'
import PhotoCarousel from '../components/PhotoCarousel'

const features = [
  { icon: '✅', title: 'Quality Assured', desc: 'All items are cleaned, inspected and event-ready.' },
  { icon: '📞', title: '24/7 Support', desc: 'Our team is always available to assist you.' },
  { icon: '🎨', title: 'Custom Decor', desc: 'Fully customised decoration setups for your theme and venue.' },
  { icon: '⏱️', title: 'On-Time Setup', desc: 'We arrive early and set up everything before your guests do.' },
]

const fallbackTestimonials = [
  { name: 'Priya S.', event: 'Wedding', text: 'EventRent made our wedding absolutely magical. Everything was on time and looked stunning!' },
  { name: 'Rahul M.', event: 'Corporate Event', text: 'Professional service, great quality furniture. Will definitely use again for our next event.' },
  { name: 'Anita K.', event: 'Birthday Party', text: 'The fairy lights and flower arch transformed our venue completely. Highly recommended!' },
]

export default function Home() {
  const { reviews, submitReview } = useReviews()
  const { myOrders } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const displayReviews = reviews.length > 0 ? reviews.slice(0, 6) : fallbackTestimonials

  // Past orders eligible for review
  const pastOrders = myOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered')
  const alreadyReviewed = reviews.map(r => r.orderId)
  const pendingReview = pastOrders.find(o => !alreadyReviewed.includes(o.id))

  // Review form state
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [decoPhotos, setDecoPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [previewIdx, setPreviewIdx] = useState(0)
  const fileRef = useRef()

  const handlePhotoUpload = async (files) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('image', file)
        const res = await fetch('https://shubhlabh-production.up.railway.app/api/upload', { method: 'POST', body: fd })
        const { url } = await res.json()
        urls.push(url)
      }
      setDecoPhotos(prev => [...prev, ...urls])
    } catch { showToast('Photo upload failed', 'error') }
    finally { setUploading(false) }
  }

  const removePhoto = (i) => {
    setDecoPhotos(prev => prev.filter((_, idx) => idx !== i))
    setPreviewIdx(0)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await submitReview({
        orderId: pendingReview.id,
        name: user?.displayName || pendingReview.customer?.name || 'Customer',
        event: pendingReview.customer?.event || 'Event',
        rating, text,
        userPhoto: user?.photoURL || '',
        decorationPhotos: decoPhotos,
      })
      showToast('Thank you for your review! 🌟')
      setText(''); setDecoPhotos([]); setRating(5); setPreviewIdx(0)
    } catch { showToast('Failed to submit review.', 'error') }
    finally { setSubmitting(false) }
  }

  const [products, setProducts] = useState([])
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    Promise.all([api.getProducts(), api.getBackdrops(), api.getCutouts()])
      .then(([prods, backs, cuts]) => {
        const all = [
          ...prods.map(p => ({ ...p, _type: 'product' })),
          ...backs.map(p => ({ ...p, _type: 'backdrop' })),
          ...cuts.map(p => ({ ...p, _type: 'cutout' })),
        ].filter(p => p.image && p.stock !== 'Unavailable')
        setProducts(all.slice(0, 10))
      })
      .catch(() => {})
  }, [])

  const [visibleCount, setVisibleCount] = useState(4)

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 560) setVisibleCount(1)
      else if (window.innerWidth < 900) setVisibleCount(2)
      else setVisibleCount(4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIndex = Math.max(0, products.length - visibleCount)
  const slidePercent = 100 / visibleCount
  const prev = () => { clearInterval(timerRef.current); setCurrent(c => Math.max(0, c - 1)) }
  const next = () => { clearInterval(timerRef.current); setCurrent(c => Math.min(maxIndex, c + 1)) }

  useEffect(() => {
    if (products.length === 0) return
    timerRef.current = setInterval(() => setCurrent(c => c >= maxIndex ? 0 : c + 1), 3000)
    return () => clearInterval(timerRef.current)
  }, [products, maxIndex])
  return (
    <main>
      {/* Review Prompt — shown at very top for eligible users */}
      {user && pendingReview && (
        <section className={styles.reviewPrompt}>
          <div className={styles.reviewPromptBox}>
            <div className={styles.reviewPromptHeader}>
              <span className={styles.reviewPromptIcon}>🌟</span>
              <div>
                <h3>How was your event?</h3>
                <p>Share your experience for order <strong>{pendingReview.id}</strong></p>
                {pendingReview.customer?.date && (
                  <p style={{ fontSize: '0.78rem', color: '#0ea5e9', marginTop: '0.2rem' }}>
                    📅 Event Date: {pendingReview.customer.date}
                  </p>
                )}
              </div>
            </div>
            {/* Order item thumbnails */}
            <div className={styles.reviewItems}>
              {pendingReview.items?.slice(0, 4).map((item, i) => (
                <div key={i} className={styles.reviewItemThumb}>
                  <img src={item.image} alt={item.name} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
              <div className={styles.starRow}>
                {[1,2,3,4,5].map(n => (
                  <button type="button" key={n} onClick={() => setRating(n)}
                    className={`${styles.star} ${n <= rating ? styles.starOn : ''}`}>★</button>
                ))}
              </div>
              <textarea rows={3} placeholder="Tell us about your experience..." value={text}
                onChange={e => setText(e.target.value)} required className={styles.reviewTextarea} />
              <div className={styles.photoUpload}>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => handlePhotoUpload(e.target.files)} />
                {decoPhotos.length > 0 && (
                  <div className={styles.photoCarousel}>
                    <img src={decoPhotos[previewIdx]} alt="decoration" className={styles.photoMain} />
                    <div className={styles.photoThumbs}>
                      {decoPhotos.map((url, i) => (
                        <div key={i} className={`${styles.photoThumb} ${i === previewIdx ? styles.photoThumbActive : ''}`}>
                          <img src={url} alt="" onClick={() => setPreviewIdx(i)} />
                          <button type="button" onClick={() => removePhoto(i)}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button type="button" className={styles.photoBtn} onClick={() => fileRef.current.click()}>
                  {uploading ? 'Uploading...' : `📸 ${decoPhotos.length > 0 ? 'Add More Photos' : 'Add Decoration Photos'}`}
                </button>
              </div>
              <button type="submit" className={styles.reviewSubmitBtn} disabled={submitting}>
                {submitting ? 'Submitting...' : '🌟 Submit Review'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>✨ Trusted Event Planner</span>
          <h1>Make Your Event <span>Unforgettable</span></h1>
          <p>Premium rental products for weddings, birthdays, corporate events and more. Delivered to your venue.</p>
          <div className={styles.heroActions}>
            <Link to="/products" className={styles.btnPrimary}>Browse Products</Link>
            <Link to="/contact" className={styles.btnOutline}>Get a Quote</Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=700&q=80" alt="Beautiful event setup" />
        </div>
      </section>

      {/* Decoration Carousel */}
      {products.length > 0 && (
        <section className={styles.carousel}>
          <h2>Latest Decorations</h2>
          <p>Fresh additions to our collection</p>
          <div className={styles.carouselWrap}>
            <button className={styles.carouselBtn} onClick={prev} disabled={current === 0}>‹</button>
            <div className={styles.carouselTrack}>
              <div className={styles.carouselSlider} style={{ transform: `translateX(-${current * slidePercent}%)` }}>
                {products.map((p) => (
                  <div key={p._id} className={styles.carouselCard} style={{ flex: `0 0 ${slidePercent}%` }}>
                    <div className={styles.carouselCardInner}>
                      <img src={p.image} alt={p.name} />
                      <div className={styles.carouselInfo}>
                        <h3>{p.name}</h3>
                        <span className={styles.carouselPrice}>{p.price}</span>
                        <Link to="/products" className={styles.carouselCta}>View →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className={styles.carouselBtn} onClick={next} disabled={current >= maxIndex}>›</button>
          </div>
          {/* Dots — max 5 visible, sliding window */}
          <div className={styles.carouselDots}>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => {
              const total = maxIndex + 1
              if (total <= 5) {
                return <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} onClick={() => setCurrent(i)} />
              }
              // Show only 5 dots around current
              const half = 2
              let start = Math.max(0, current - half)
              let end = Math.min(total - 1, start + 4)
              start = Math.max(0, end - 4)
              if (i < start || i > end) return null
              return <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} onClick={() => setCurrent(i)} />
            })}
          </div>
        </section>
      )}

      {/* Features */}
      <section className={styles.features}>
        <h2>Why Choose Us</h2>
        <div className={styles.featureGrid}>
          {features.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <span>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products Preview */}
      <section className={styles.preview}>
        <h2>Popular Rentals</h2>
        <p>A glimpse of what we offer</p>
        <div className={styles.previewGrid}>
          {[
            { name: 'Chiavari Chairs', img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80' },
            { name: 'Flower Arch', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80' },
            { name: 'Fairy Light Canopy', img: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&q=80' },
          ].map(p => (
            <div key={p.name} className={styles.previewCard}>
              <img src={p.img} alt={p.name} />
              <p>{p.name}</p>
            </div>
          ))}
        </div>
        <Link to="/products" className={styles.btnPrimary}>View All Products</Link>
      </section>

      {/* How It Works */}
      <section className={styles.howSection}>
        <div className={styles.howHeader}>
          <span className={styles.howBadge}>Simple Process</span>
          <h2>How It Works</h2>
          <p>From browsing to your big day — just 4 easy steps</p>
        </div>

        <div className={styles.stepsWrap}>
          {[
            {
              step: '01',
              icon: '🛍️',
              title: 'Browse & Select',
              desc: 'Explore our catalog of chairs, tables, backdrops, decor and more. Add what you need to your cart.',
              color: '#0ea5e9',
              bg: '#e0f2fe',
            },
            {
              step: '02',
              icon: '📋',
              title: 'Place Your Order',
              desc: 'Fill in your event date, pickup & return dates, and delivery address. Place your order in seconds.',
              color: '#2563eb',
              bg: '#dbeafe',
            },
            {
              step: '03',
              icon: '🚚',
              title: 'We Deliver & Setup',
              desc: 'Our team delivers everything to your venue and sets it all up before your guests arrive.',
              color: '#16a34a',
              bg: '#dcfce7',
            },
            {
              step: '04',
              icon: '🎉',
              title: 'Enjoy Your Event',
              desc: 'Relax and enjoy your special day. We handle pickup and return after the event.',
              color: '#d97706',
              bg: '#fef3c7',
            },
          ].map((s, i) => (
            <div key={s.step} className={styles.stepCard}>
              {/* Connector line */}
              {i < 3 && <div className={styles.connector} />}

              <div className={styles.stepIconWrap} style={{ background: s.bg }}>
                <span className={styles.stepEmoji}>{s.icon}</span>
                <span className={styles.stepNum} style={{ color: s.color }}>{s.step}</span>
              </div>

              <div className={styles.stepContent}>
                <h3 style={{ color: s.color }}>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.howCta}>
          <Link to="/products" className={styles.btnPrimary}>Start Browsing →</Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <h2>What Our Clients Say</h2>
        <div className={styles.testimonialGrid}>
          {displayReviews.map((t, i) => (
            <div key={t._id || i} className={styles.testimonialCard}>
              <div className={styles.testimonialTop}>
                {t.userPhoto
                  ? <img src={t.userPhoto} alt={t.name} className={styles.reviewAvatar} referrerPolicy="no-referrer" />
                  : <div className={styles.reviewAvatarFallback}>{t.name?.[0]}</div>
                }
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.event}</span>
                </div>
                {t.rating && (
                  <div className={styles.reviewStars}>
                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                  </div>
                )}
              </div>
              {t.decorationPhotos?.length > 0 && <PhotoCarousel photos={t.decorationPhotos} />}
              <p>"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.cta}>
        <h2>Ready to Plan Your Event?</h2>
        <p>Get in touch today and let us make it special.</p>
        <Link to="/contact" className={styles.btnWhite}>Contact Us Now</Link>
      </section>
    </main>
  )
}
