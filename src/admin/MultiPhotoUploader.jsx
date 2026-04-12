import { useState } from 'react'
import styles from './AdminProducts.module.css'

export default function MultiPhotoUploader({ photos = [], onChange }) {
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('image', file)
        const res = await fetch('https://shubhlabh-production.up.railway.app/api/upload', { method: 'POST', body: fd })
        const { url } = await res.json()
        urls.push(url)
      }
      onChange([...photos, ...urls])
    } catch (err) { console.error(err) }
    finally { setUploading(false) }
  }

  const remove = (i) => onChange(photos.filter((_, idx) => idx !== i))

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#555' }}>
        Product Photos (multiple)
      </label>
      <input type="file" accept="image/*" multiple
        onChange={e => handleFiles(e.target.files)}
        style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }} />
      {uploading && <p style={{ fontSize: '0.78rem', color: '#0ea5e9' }}>Uploading...</p>}
      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
          {photos.map((url, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '2px solid #e0f2fe' }} />
              <button type="button" onClick={() => remove(i)}
                style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
