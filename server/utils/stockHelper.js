function calcStock(quantity) {
  const qty = parseInt(quantity) || 0
  if (qty === 0) return 'Unavailable'
  if (qty <= 3) return 'Low Stock'
  return 'Available'
}

module.exports = { calcStock }
