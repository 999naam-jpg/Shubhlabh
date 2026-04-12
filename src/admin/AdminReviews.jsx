import { useReviews } from '../context/ReviewContext'
import PhotoCarousel from '../components/PhotoCarousel'
import styles from './AdminReviews.module.css'

const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function AdminReviews() {
  const { reviews, deleteReview } = useReviews()

  return (
    <div>
      <div className={styles.topRow}>
        <h2 className={styles.heading}>⭐ Customer Reviews</h2>
        <span className={styles.count}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
      </div>

      {reviews.length === 0 ? (
        <div className={styles.empty}>No reviews yet. They'll appear here once customers submit them.</div>
      ) : (
        <div className={styles.grid}>
          {reviews.map(r => (
            <div key={r._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.user}>
                  {r.userPhoto
                    ? <img src={r.userPhoto} alt={r.name} />
                    : <div className={styles.avatar}>{r.name?.[0]}</div>
                  }
                  <div>
                    <p className={styles.name}>{r.name}</p>
                    <span className={styles.event}>{r.event}</span>
                  </div>
                </div>
                <div className={styles.right}>
                  <div className={styles.stars}>{stars(r.rating)}</div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => { if (confirm('Delete this review?')) deleteReview(r._id) }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
              <p className={styles.text}>"{r.text}"</p>
              {r.decorationPhotos?.length > 0 && <PhotoCarousel photos={r.decorationPhotos} />}
              <div className={styles.meta}>
                <span>Order: {r.orderId}</span>
                {r.createdAt?.seconds && (
                  <span>{new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
