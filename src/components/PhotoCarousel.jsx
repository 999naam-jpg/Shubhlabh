import { useState } from 'react'
import styles from './PhotoCarousel.module.css'

export default function PhotoCarousel({ photos }) {
  const [idx, setIdx] = useState(0)
  if (!photos?.length) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
        <img src={photos[idx]} alt="decoration" />
        {photos.length > 1 && (
          <>
            <button className={`${styles.arrow} ${styles.left}`} onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)}>‹</button>
            <button className={`${styles.arrow} ${styles.right}`} onClick={() => setIdx(i => (i + 1) % photos.length)}>›</button>
            <span className={styles.counter}>{idx + 1}/{photos.length}</span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className={styles.thumbs}>
          {photos.map((url, i) => (
            <img key={i} src={url} alt="" className={`${styles.thumb} ${i === idx ? styles.thumbActive : ''}`}
              onClick={() => setIdx(i)} />
          ))}
        </div>
      )}
    </div>
  )
}
