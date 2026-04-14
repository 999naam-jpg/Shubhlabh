import { useState, useEffect } from 'react'
import { api } from '../api'
import ImageUploader from './ImageUploader'
import MultiPhotoUploader from './MultiPhotoUploader'
import styles from './AdminProducts.module.css'

const STOCK = ['Available', 'Low Stock', 'Unavailable']
const empty = { name: '', price: '', image: '', stock: 'Available', quantity: '', trending: false }

export default function AdminCutouts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getCutouts()
      .then(data => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
  const openAdd = () => { setForm(empty); setModal('add') }
  const openEdit = (p) => { setForm({ ...p }); setModal(p) }

  const handleSave = async () => {
    if (!form.name || !form.price) return
    try {
      if (modal === 'add') {
        const saved = await api.createCutout(form)
        setItems(prev => [...prev, saved])
      } else {
        const updated = await api.updateCutout(modal._id, form)
        setItems(prev => prev.map(p => p._id === modal._id ? updated : p))
      }
      setModal(null)
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return
    try {
      await api.deleteCutout(p._id)
      setItems(prev => prev.filter(x => x._id !== p._id))
    } catch (err) { console.error(err) }
  }

  const stockColor = { Available: '#16a34a', 'Low Stock': '#d97706', Unavailable: '#dc2626' }

  return (
    <div>
      <div className={styles.topRow}>
        <h2 className={styles.heading}>✂️ Cutouts</h2>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Cutout</button>
      </div>
      <input className={styles.search} placeholder="🔍  Search cutouts..." value={search} onChange={e => setSearch(e.target.value)} />
      {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Item</th><th>Price</th><th>Stock</th><th>Qty</th><th>Trending</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td><div className={styles.productCell}><img src={p.image} alt={p.name} /><span>{p.name}</span></div></td>
                  <td className={styles.price}>{p.price}</td>
                  <td><span className={styles.stock} style={{ color: stockColor[p.stock], background: stockColor[p.stock] + '18' }}>{p.stock}</span></td>
                  <td><span className={styles.qty}>{p.quantity ?? '—'}</span></td>
                  <td>{p.trending ? '🔥' : '—'}</td>
                  <td><div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => openEdit(p)}>✏️ Edit</button>
                    <button className={styles.delBtn} onClick={() => handleDelete(p)}>🗑 Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>{modal === 'add' ? '➕ Add Cutout' : '✏️ Edit Cutout'}</h3>
                <p>{modal === 'add' ? 'Fill in the details' : `Editing: ${form.name}`}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <div className={styles.modalSection}>
              <span className={styles.sectionLabel}>Basic Info</span>
              <div className={styles.formGrid}>
                <div className={styles.formField} style={{ gridColumn: 'span 2' }}><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className={styles.formField}><label>Price *</label><input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. ₹500/number" /></div>
                <div className={styles.formField}><label>Quantity</label><input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value === '' ? '' : Number(e.target.value) })} /></div>
              </div>
            </div>
            <div className={styles.modalSection}>
              <span className={styles.sectionLabel}>Status</span>
              <label className={styles.trendingToggle}>
                <input type="checkbox" checked={form.trending} onChange={e => setForm({ ...form, trending: e.target.checked })} />
                <span className={`${styles.trendingBox} ${form.trending ? styles.trendingOn : ''}`}>
                  🔥 {form.trending ? 'Trending' : 'Not Trending'}
                </span>
              </label>
            </div>
            <div className={styles.modalSection}>
              <span className={styles.sectionLabel}>Images</span>
              <div className={styles.formField}><label>Cover Image</label><ImageUploader value={form.image} onChange={v => setForm({ ...form, image: v })} /></div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>
                {modal === 'add' ? '➕ Add Cutout' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
