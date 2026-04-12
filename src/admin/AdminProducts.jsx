import { useState, useEffect } from 'react'
import { api } from '../api'
import ImageUploader from './ImageUploader'
import MultiPhotoUploader from './MultiPhotoUploader'
import IncludedItemsPicker from './IncludedItemsPicker'
import styles from './AdminProducts.module.css'

const STOCK = ['Available', 'Low Stock', 'Unavailable']
const empty = { name: '', category: '', price: '', image: '', stock: 'Available', quantity: '', trending: false, desc: '', photos: [], includedProducts: [] }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods.map(p => ({ ...p, _id: p._id })))
        setCategories([...new Set(cats.map(c => c.name))])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setForm(empty); setModal('add') }
  const openEdit = (p) => { setForm({ ...p }); setModal(p) }

  const handleSave = async () => {
    if (!form.name || !form.price) return
    try {
      if (modal === 'add') {
        const saved = await api.createProduct(form)
        setProducts(prev => [...prev, saved])
      } else {
        const updated = await api.updateProduct(modal._id, form)
        setProducts(prev => prev.map(p => p._id === modal._id ? updated : p))
      }
      setModal(null)
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return
    try {
      await api.deleteProduct(p._id)
      setProducts(prev => prev.filter(x => x._id !== p._id))
    } catch (err) { console.error(err) }
  }

  const stockColor = { Available: '#16a34a', 'Low Stock': '#d97706', Unavailable: '#dc2626' }

  return (
    <div>
      <div className={styles.topRow}>
        <h2 className={styles.heading}>Products</h2>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Product</button>
      </div>

      <input className={styles.search} placeholder="🔍  Search products..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Qty</th><th>Trending</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className={styles.productCell}>
                      <img src={p.image} alt={p.name} />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td><span className={styles.catBadge}>{p.category}</span></td>
                  <td className={styles.price}>{p.price}</td>
                  <td><span className={styles.stock} style={{ color: stockColor[p.stock], background: stockColor[p.stock] + '18' }}>{p.stock}</span></td>
                  <td><span className={styles.qty}>{p.quantity ?? '—'}</span></td>
                  <td>{p.trending ? '🔥' : '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(p)}>✏️ Edit</button>
                      <button className={styles.delBtn} onClick={() => handleDelete(p)}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3>{modal === 'add' ? '➕ Add Product' : '✏️ Edit Product'}</h3>
                <p>{modal === 'add' ? 'Fill in the details to add a new product' : `Editing: ${form.name}`}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>

            {/* Section: Basic Info */}
            <div className={styles.modalSection}>
              <span className={styles.sectionLabel}>Basic Info</span>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
                </div>
                <div className={styles.formField}>
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">— Select —</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.formField}>
                  <label>Price *</label>
                  <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. ₹500/day" />
                </div>
                <div className={styles.formField}>
                  <label>Quantity</label>
                  <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="e.g. 10" />
                </div>
              </div>
              <div className={styles.formField}>
                <label>Description</label>
                <textarea value={form.desc || ''} onChange={e => setForm({ ...form, desc: e.target.value })} rows={2} placeholder="Short description..." />
              </div>
            </div>

            {/* Section: Stock & Trending */}
            <div className={styles.modalSection}>
              <span className={styles.sectionLabel}>Status</span>
              <div className={styles.statusRow}>
                <div className={styles.formField} style={{ flex: 1 }}>
                  <label>Stock Status</label>
                  <select value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}>
                    {STOCK.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <label className={styles.trendingToggle}>
                  <input type="checkbox" checked={form.trending} onChange={e => setForm({ ...form, trending: e.target.checked })} />
                  <span className={`${styles.trendingBox} ${form.trending ? styles.trendingOn : ''}`}>
                    🔥 {form.trending ? 'Trending' : 'Not Trending'}
                  </span>
                </label>
              </div>
            </div>

            {/* Section: Images */}
            <div className={styles.modalSection}>
              <span className={styles.sectionLabel}>Images</span>
              <div className={styles.formField}>
                <label>Cover Image</label>
                <ImageUploader value={form.image} onChange={v => setForm({ ...form, image: v })} />
              </div>
              <div className={styles.formField}>
                <MultiPhotoUploader photos={form.photos || []} onChange={v => setForm({ ...form, photos: v })} />
              </div>
            </div>

            {/* Section: Included Products */}
            <div className={styles.modalSection}>
              <span className={styles.sectionLabel}>Included Items</span>
              <IncludedItemsPicker
                selected={form.includedProducts || []}
                onChange={v => setForm({ ...form, includedProducts: v })}
              />
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>
                {modal === 'add' ? '➕ Add Product' : '💾 Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
