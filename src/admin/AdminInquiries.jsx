import { useState, useEffect } from 'react'
import { api } from '../api'
import styles from './AdminInquiries.module.css'

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.getInquiries()
      .then(data => setInquiries(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRead = async (id) => {
    await api.markInquiryRead(id)
    setInquiries(prev => prev.map(i => i._id === id ? { ...i, read: true } : i))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this inquiry?')) return
    await api.deleteInquiry(id)
    setInquiries(prev => prev.filter(i => i._id !== id))
  }

  const unread = inquiries.filter(i => !i.read).length

  return (
    <div>
      <div className={styles.topRow}>
        <div>
          <h2 className={styles.heading}>📩 Inquiries</h2>
          <p className={styles.sub}>Customer enquiries from the contact form</p>
        </div>
        {unread > 0 && <span className={styles.unreadBadge}>{unread} new</span>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div>
      ) : inquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>No inquiries yet.</div>
      ) : (
        <div className={styles.list}>
          {inquiries.map(inq => (
            <div key={inq._id} className={`${styles.card} ${!inq.read ? styles.unread : ''}`}
              onClick={() => { setExpanded(expanded === inq._id ? null : inq._id); if (!inq.read) handleRead(inq._id) }}>
              <div className={styles.cardHead}>
                <div className={styles.headLeft}>
                  {!inq.read && <span className={styles.dot} />}
                  <div>
                    <p className={styles.name}>{inq.name}</p>
                    <p className={styles.meta}>{inq.email} {inq.phone && `· ${inq.phone}`}</p>
                  </div>
                </div>
                <div className={styles.headRight}>
                  {inq.event && <span className={styles.eventBadge}>{inq.event}</span>}
                  {inq.date && <span className={styles.dateBadge}>📅 {inq.date}</span>}
                  <span className={styles.time}>
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={styles.chevron}>{expanded === inq._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === inq._id && (
                <div className={styles.body} onClick={e => e.stopPropagation()}>
                  <p className={styles.message}>{inq.message || <em style={{ color: '#aaa' }}>No message</em>}</p>
                  <div className={styles.actions}>
                    <a href={`mailto:${inq.email}`} className={styles.replyBtn}>✉️ Reply</a>
                    {inq.phone && <a href={`https://wa.me/91${inq.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className={styles.waBtn}>💬 WhatsApp</a>}
                    <button className={styles.delBtn} onClick={() => handleDelete(inq._id)}>🗑 Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
