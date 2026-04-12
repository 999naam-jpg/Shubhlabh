import { useState, useEffect } from 'react'
import { api } from '../api'
import styles from './AdminProducts.module.css'

export default function AdminCategories() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '' })

  useEffect(() => {
    api.getCategories()
      .then(data => setCats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => { setForm({ name: '', icon: '' }); setModal('add') }
  const openEdit = (c) => { setForm({ ...c }); setModal(c) }

  const handleSave = async () => {
    if (!form.name) return
    try {
      if (modal === 'add') {
        const saved = await api.createCategory({ name: form.name, icon: form.icon })
        setCats(prev => [...prev, saved])
      } else {
        const updated = await api.updateCategory(modal._id, { name: form.name, icon: form.icon })
        setCats(prev => prev.map(c => c._id === modal._id ? updated : c))
      }
      setModal(null)
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return
    try {
      await api.deleteCategory(c._id)
      setCats(prev => prev.filter(x => x._id !== c._id))
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <div className={styles.topRow}>
        <h2 className={styles.heading}>🗂️ Categories</h2>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Category</button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Icon</th><th>Category Name</th><th>Actions</th></tr></thead>
            <tbody>
              {cats.map(c => (
                <tr key={c._id}>
                  <td style={{ fontSize: '1.5rem' }}>{c.icon || '📦'}</td>
                  <td><span className={styles.catBadge}>{c.name}</span></td>
                  <td><div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => openEdit(c)}>✏️ Edit</button>
                    <button className={styles.delBtn} onClick={() => handleDelete(c)}>🗑 Delete</button>
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
            <h3>{modal === 'add' ? 'Add Category' : 'Edit Category'}</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField} style={{ gridColumn: 'span 2' }}>
                <label>Category Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Seating" />
              </div>
              <div className={styles.formField} style={{ gridColumn: 'span 2' }}>
                <label>Icon (emoji)</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 🪑" />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
