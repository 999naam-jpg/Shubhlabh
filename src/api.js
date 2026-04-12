const BASE = 'http://localhost:5000/api'

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  // Orders
  getOrders:        ()           => req('GET',    '/orders'),
  createOrder:      (data)       => req('POST',   '/orders', data),
  updateOrder:      (id, data)   => req('PATCH',  `/orders/${id}`, data),

  // Products
  getProducts:      ()           => req('GET',    '/products'),
  createProduct:    (data)       => req('POST',   '/products', data),
  updateProduct:    (id, data)   => req('PATCH',  `/products/${id}`, data),
  deleteProduct:    (id)         => req('DELETE', `/products/${id}`),

  // Backdrops
  getBackdrops:     ()           => req('GET',    '/backdrops'),
  createBackdrop:   (data)       => req('POST',   '/backdrops', data),
  updateBackdrop:   (id, data)   => req('PATCH',  `/backdrops/${id}`, data),
  deleteBackdrop:   (id)         => req('DELETE', `/backdrops/${id}`),

  // Cutouts
  getCutouts:       ()           => req('GET',    '/cutouts'),
  createCutout:     (data)       => req('POST',   '/cutouts', data),
  updateCutout:     (id, data)   => req('PATCH',  `/cutouts/${id}`, data),
  deleteCutout:     (id)         => req('DELETE', `/cutouts/${id}`),

  // Categories
  getCategories:    ()           => req('GET',    '/categories'),
  createCategory:   (data)       => req('POST',   '/categories', data),
  updateCategory:   (id, data)   => req('PATCH',  `/categories/${id}`, data),
  deleteCategory:   (id)         => req('DELETE', `/categories/${id}`),

  // Reviews
  getReviews:       ()           => req('GET',    '/reviews'),
  createReview:     (data)       => req('POST',   '/reviews', data),
  updateReview:     (id, data)   => req('PATCH',  `/reviews/${id}`, data),
  deleteReview:     (id)         => req('DELETE', `/reviews/${id}`),

  // Other Products
  getOtherProducts:    ()         => req('GET',    '/other-products'),
  createOtherProduct:  (data)     => req('POST',   '/other-products', data),
  updateOtherProduct:  (id, data) => req('PATCH',  `/other-products/${id}`, data),
  deleteOtherProduct:  (id)       => req('DELETE', `/other-products/${id}`),

  // Inquiries
  getInquiries:     ()           => req('GET',    '/inquiries'),
  createInquiry:    (data)       => req('POST',   '/inquiries', data),
  markInquiryRead:  (id)         => req('PATCH',  `/inquiries/${id}`, { read: true }),
  deleteInquiry:    (id)         => req('DELETE', `/inquiries/${id}`),
}
