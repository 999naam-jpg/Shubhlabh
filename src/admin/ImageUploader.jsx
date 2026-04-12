import { useRef, useState } from 'react'
import styles from './ImageUploader.module.css'

export default function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('https://shubhlabh-production.up.railway.app/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      onChange(url)
    } catch (err) {
      setError('Upload failed. Try pasting a URL instead.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = e => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className={styles.wrap}>
      {value && <img src={value} alt="preview" className={styles.preview} />}

      <div
        className={styles.dropzone}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {uploading ? (
          <span>Uploading...</span>
        ) : (
          <>
            <span className={styles.icon}>📁</span>
            <p>Click or drag image here</p>
            <span className={styles.sub}>JPG, PNG, WEBP — max 5MB</span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {error && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.3rem' }}>{error}</p>}

      <input
        className={styles.urlInput}
        placeholder="Or paste image URL..."
        value={value?.startsWith('http://localhost') || value?.startsWith('data:') ? '' : (value || '')}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
