import { useState } from 'react'
import styles from './Gallery.module.css'

const images = [
  { id: 1, src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80', tag: 'Wedding', title: 'Grand Wedding Setup' },
  { id: 2, src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80', tag: 'Wedding', title: 'Chiavari Chair Arrangement' },
  { id: 3, src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', tag: 'Decor', title: 'Floral Arch Ceremony' },
  { id: 4, src: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80', tag: 'Decor', title: 'Fairy Light Canopy' },
  { id: 5, src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80', tag: 'Corporate', title: 'Corporate Banquet' },
  { id: 6, src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', tag: 'Corporate', title: 'Conference Setup' },
  { id: 7, src: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80', tag: 'Birthday', title: 'Birthday Party Lights' },
  { id: 8, src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', tag: 'Birthday', title: 'Birthday Backdrop' },
  { id: 9, src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80', tag: 'Corporate', title: 'Outdoor Event' },
]

const tags = ['All', 'Wedding', 'Corporate', 'Birthday', 'Decor']

export default function Gallery() {
  const [active, setActive] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const filtered = active === 'All' ? images : images.filter(i => i.tag === active)

  return (
    <main>
      <section className={styles.hero}>
        <h1>Event Gallery</h1>
        <p>A look at some of the beautiful events we've been part of</p>
      </section>

      <section className={styles.section}>
        <div className={styles.filters}>
          {tags.map(t => (
            <button
              key={t}
              className={`${styles.filter} ${active === t ? styles.filterActive : ''}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map(img => (
            <div key={img.id} className={styles.item} onClick={() => setLightbox(img)}>
              <img src={img.src} alt={img.title} />
              <div className={styles.overlay}>
                <span className={styles.tag}>{img.tag}</span>
                <p>{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.src.replace('w=600', 'w=1000')} alt={lightbox.title} />
            <p>{lightbox.title}</p>
          </div>
        </div>
      )}
    </main>
  )
}
