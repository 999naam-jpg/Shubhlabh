export default function BabyBadge({ gender }) {
  if (!gender) return null
  const style = {
    'Baby Boy':  { bg: '#dbeafe', color: '#1d4ed8', label: '👦 Baby Boy' },
    'Baby Girl': { bg: '#fce7f3', color: '#be185d', label: '👧 Baby Girl' },
    'Twins':     { bg: '#f3e8ff', color: '#7c3aed', label: '👶👶 Twins' },
  }[gender] || { bg: '#f1f5f9', color: '#475569', label: `👶 ${gender}` }

  return (
    <span style={{
      background: style.bg, color: style.color,
      fontSize: '0.75rem', fontWeight: 700,
      padding: '0.2rem 0.7rem', borderRadius: '999px',
      display: 'inline-block',
    }}>
      {style.label}
    </span>
  )
}
