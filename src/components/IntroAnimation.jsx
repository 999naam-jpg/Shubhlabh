import { useState, useEffect } from 'react'
import styles from './IntroAnimation.module.css'

export default function IntroAnimation({ onDone }) {
  const [phase, setPhase] = useState(0)
  // phase 0: logo zoom in
  // phase 1: tagline appears
  // phase 2: full fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800)
    const t2 = setTimeout(() => setPhase(2), 2200)
    const t3 = setTimeout(() => onDone(), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className={`${styles.intro} ${phase === 2 ? styles.fadeOut : ''}`}>
      {/* Particles */}
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
          }} />
        ))}
      </div>

      <div className={styles.center}>
        {/* Logo */}
        <div className={`${styles.logoWrap} ${phase >= 0 ? styles.logoIn : ''}`}>
          <img src="/551402660_17843895663577377_7895316719802754113_n.jpg" alt="Shubh Labh Event" className={styles.logo} />
        </div>

        {/* Brand name */}
        <div className={`${styles.brand} ${phase >= 1 ? styles.brandIn : ''}`}>
          {'Shubh Labh Event'.split('').map((char, i) => (
            <span key={i} className={styles.char} style={{ animationDelay: `${i * 0.05}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p className={`${styles.tagline} ${phase >= 1 ? styles.taglineIn : ''}`}>
          ✨ Making Every Event Unforgettable ✨
        </p>
      </div>
    </div>
  )
}
