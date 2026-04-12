import { createContext, useContext, useState, useCallback } from 'react'
import styles from './Toast.module.css'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', item = null) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, item }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map(t => (
          t.item ? (
            // Rich cart toast
            <div key={t.id} className={`${styles.toast} ${styles.cartToast}`}>
              <img src={t.item.image} alt={t.item.name} className={styles.toastImg} />
              <div className={styles.toastInfo}>
                <p className={styles.toastAdded}>Added to cart!</p>
                <p className={styles.toastName}>{t.item.name}</p>
                <p className={styles.toastPrice}>{t.item.price}</p>
              </div>
              <div className={styles.toastActions}>
                <a href="/cart" className={styles.viewCartBtn} onClick={() => remove(t.id)}>
                  View Cart →
                </a>
                <button className={styles.toastClose} onClick={() => remove(t.id)}>✕</button>
              </div>
            </div>
          ) : (
            // Simple toast
            <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
              <span>{t.type === 'success' ? '✅' : '⚠️'}</span>
              <p>{t.message}</p>
              <button onClick={() => remove(t.id)}>✕</button>
            </div>
          )
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
