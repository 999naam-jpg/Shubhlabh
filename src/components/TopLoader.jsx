import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './TopLoader.module.css'

export default function TopLoader() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    setLoading(true)
    setWidth(0)

    const t1 = setTimeout(() => setWidth(70), 50)
    const t2 = setTimeout(() => setWidth(100), 400)
    const t3 = setTimeout(() => setLoading(false), 700)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [location.pathname])

  if (!loading && width === 0) return null

  return (
    <div className={styles.bar} style={{ width: `${width}%`, opacity: loading ? 1 : 0 }} />
  )
}
