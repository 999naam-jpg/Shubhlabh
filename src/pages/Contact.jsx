import { useState } from 'react'
import { api } from '../api'
import styles from './Contact.module.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', event: '', date: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createInquiry(form)
      setSent(true)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <main>
      <section className={styles.hero}>
        <h1>Contact Us</h1>
        <p>We'd love to hear about your event. Let's make it amazing together.</p>
      </section>

      <section className={styles.section}>
        {/* Info Cards */}
        <div className={styles.infoGrid}>
          {[
            { icon: '📍', title: 'Our Location', lines: ['123 Event Street', 'Mumbai, Maharashtra 400001'] },
            { icon: '📞', title: 'Phone', lines: ['+91 95124 12800', '+91 84888 28839'] },
            { icon: '✉️', title: 'Email', lines: ['hello@eventrent.com', 'bookings@eventrent.com'] },
            { icon: '🕐', title: 'Working Hours', lines: ['Mon – Sat: 9am – 7pm', 'Sunday: 10am – 4pm'] },
          ].map(c => (
            <div key={c.title} className={styles.infoCard}>
              <span>{c.icon}</span>
              <h3>{c.title}</h3>
              {c.lines.map(l => <p key={l}>{l}</p>)}
            </div>
          ))}
        </div>

        {/* Form + Map */}
        <div className={styles.bottom}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h2>Send an Enquiry</h2>
            {sent ? (
              <div className={styles.success}>
                🎉 Thank you! We'll get back to you within 24 hours.
              </div>
            ) : (
              <>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Your Name *</label>
                    <input name="name" required placeholder="Full name" value={form.name} onChange={handleChange} />
                  </div>
                  <div className={styles.field}>
                    <label>Email Address *</label>
                    <input name="email" type="email" required placeholder="you@email.com" value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Phone Number</label>
                    <input name="phone" placeholder="+91 00000 00000" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className={styles.field}>
                    <label>Event Type</label>
                    <select name="event" value={form.event} onChange={handleChange}>
                      <option value="">Select event type</option>
                      <option>Wedding</option>
                      <option>Birthday Party</option>
                      <option>Corporate Event</option>
                      <option>Baby Shower</option>
                      <option>Anniversary</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Event Date</label>
                  <input name="date" type="date" value={form.date} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label>Message</label>
                  <textarea name="message" rows={4} placeholder="Tell us about your event, venue, and what products you need..." value={form.message} onChange={handleChange} />
                </div>
                <button type="submit" className={styles.btn} disabled={loading}>{loading ? 'Sending...' : 'Send Enquiry →'}</button>
              </>
            )}
          </form>

          <div className={styles.mapBox}>
            <h2>Find Us</h2>
            <iframe
              title="EventRent Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="350"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
