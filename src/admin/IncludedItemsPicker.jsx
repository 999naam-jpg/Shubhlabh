import { useState, useEffect } from 'react'
import { api } from '../api'

export default function IncludedItemsPicker({ selected = [], onChange }) {
  const [allItems, setAllItems] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([api.getBackdrops(), api.getCutouts(), api.getOtherProducts()])
      .then(([backs, cuts, others]) => {
        setAllItems([
          ...backs.map(i => ({ ...i, _type: '🖼️ Backdrop' })),
          ...cuts.map(i => ({ ...i, _type: '✂️ Cutout' })),
          ...others.map(i => ({ ...i, _type: '📦 Other' })),
        ])
      })
      .catch(console.error)
  }, [])

  const filtered = allItems.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (item) => {
    const exists = selected.find(s => s._id === item._id)
    if (exists) onChange(selected.filter(s => s._id !== item._id))
    else onChange([...selected, { _id: item._id, name: item.name, image: item.image, price: item.price, _type: item._type }])
  }

  const isSelected = (id) => selected.some(s => s._id === id)

  return (
    <div>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.4rem' }}>
        Included Items
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
          {selected.map(s => (
            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#e0f2fe', color: '#0ea5e9', borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 600 }}>
              {s.image && <img src={s.image} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />}
              {s.name}
              <button type="button" onClick={() => toggle(s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0ea5e9', fontWeight: 700, fontSize: '0.8rem', padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        placeholder="🔍 Search backdrops, cutouts, other products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '0.4rem' }}
      />

      {/* Item list */}
      {search && (
        <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff' }}>
          {filtered.length === 0 ? (
            <p style={{ padding: '0.8rem', color: '#aaa', fontSize: '0.82rem', textAlign: 'center' }}>No items found</p>
          ) : filtered.map(item => (
            <div key={item._id}
              onClick={() => toggle(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.55rem 0.8rem', cursor: 'pointer',
                background: isSelected(item._id) ? '#f0f9ff' : '#fff',
                borderBottom: '1px solid #f5f5f5',
                transition: 'background 0.15s',
              }}>
              {item.image && <img src={item.image} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.name}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{item._type} · {item.price}</p>
              </div>
              {isSelected(item._id) && <span style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.85rem' }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
