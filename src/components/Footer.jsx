import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <span>Shubh Labh Event</span>
          </div>
          <p>Premium event decoration rentals for weddings, birthdays, corporate events and more. Delivered with care.</p>
          <a href="https://www.instagram.com/shubh.labhevent/" target="_blank" rel="noreferrer" className={styles.instaBtn}>
            📸 @shubh.labhevent
          </a>
        </div>

        {/* Quick Links */}
        <div className={styles.col}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Decoration</Link></li>
            <li><Link to="/backdrops">Backdrops</Link></li>
            <li><Link to="/cutouts">Cutouts</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
          </ul>
        </div>

        {/* Backdrops */}
        <div className={styles.col}>
          <h4>Backdrops</h4>
          <ul>
            <li><Link to="/backdrops">Floral Backdrop</Link></li>
            <li><Link to="/backdrops">Sequin Shimmer</Link></li>
            <li><Link to="/backdrops">Fairy Light Curtain</Link></li>
            <li><Link to="/backdrops">Rustic Wooden</Link></li>
            <li><Link to="/backdrops">Geometric Frame</Link></li>
          </ul>
        </div>

        {/* Cutouts */}
        <div className={styles.col}>
          <h4>Cutouts</h4>
          <ul>
            <li><Link to="/cutouts">Bride & Groom</Link></li>
            <li><Link to="/cutouts">Number Cutouts</Link></li>
            <li><Link to="/cutouts">Letter Cutouts</Link></li>
            <li><Link to="/cutouts">Photo Booth Frame</Link></li>
            <li><Link to="/cutouts">Cartoon Standees</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4>Contact Us</h4>
          <ul>
            <li>📍 Surat, Gujarat</li>
            <li>📞 <a href="tel:+919512412800">+91 95124 12800</a></li>
            <li>📞 <a href="tel:+918488828839">+91 84888 28839</a></li>
            <li>✉️ <a href="mailto:shubh.labhevent@gmail.com">shubh.labhevent@gmail.com</a></li>
            <li>📸 <a href="https://www.instagram.com/shubh.labhevent/" target="_blank" rel="noreferrer">Instagram</a></li>
            <li>🕐 Mon–Sat: 9am – 7pm</li>
          </ul>
        </div>

      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Shubh Labh Event. All rights reserved.</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.3rem' }}>Made with ❤️ for beautiful events</p>
      </div>
    </footer>
  )
}
