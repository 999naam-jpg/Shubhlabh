import { Link } from 'react-router-dom'
import styles from './About.module.css'

const team = [
  { name: 'Arjun Sharma', role: 'Founder & Event Director', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
  { name: 'Priya Nair', role: 'Decor Specialist', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
  { name: 'Karan Mehta', role: 'Logistics Manager', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
]

const stats = [
  { num: '500+', label: 'Events Completed' },
  { num: '1200+', label: 'Happy Clients' },
  { num: '8+', label: 'Years Experience' },
  { num: '50+', label: 'Rental Products' },
]

export default function About() {
  return (
    <main>
      <section className={styles.hero}>
        <h1>About EventRent</h1>
        <p>Your trusted partner for event product rentals</p>
      </section>

      {/* Story */}
      <section className={styles.story}>
        <div className={styles.storyImg}>
          <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80" alt="Our story" />
        </div>
        <div className={styles.storyText}>
          <span className={styles.badge}>Our Story</span>
          <h2>We Started Small, We Dream Big</h2>
          <p>
            EventRent was founded in 2016 with a simple mission — to make beautiful events accessible to everyone.
            What started as a small chair and table rental service has grown into a full-scale event rental company
            serving hundreds of clients every year.
          </p>
          <p>
            We believe every event deserves to look stunning, regardless of budget. That's why we offer
            premium quality products at affordable prices, with reliable delivery and setup included.
          </p>
          <Link to="/contact" className={styles.btn}>Work With Us</Link>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        {stats.map(s => (
          <div key={s.label} className={styles.stat}>
            <h3>{s.num}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className={styles.values}>
        <h2>Our Values</h2>
        <div className={styles.valuesGrid}>
          {[
            { icon: '🤝', title: 'Reliability', desc: 'We show up on time, every time. Your event timeline is our priority.' },
            { icon: '💎', title: 'Quality', desc: 'Every item is maintained to the highest standard before each rental.' },
            { icon: '❤️', title: 'Care', desc: "We treat every event like it's our own — with passion and attention to detail." },
            { icon: '🌱', title: 'Sustainability', desc: 'We reuse and recycle wherever possible to reduce event waste.' },
          ].map(v => (
            <div key={v.title} className={styles.valueCard}>
              <span>{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className={styles.team}>
        <h2>Meet the Team</h2>
        <div className={styles.teamGrid}>
          {team.map(m => (
            <div key={m.name} className={styles.teamCard}>
              <img src={m.img} alt={m.name} />
              <h3>{m.name}</h3>
              <p>{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
