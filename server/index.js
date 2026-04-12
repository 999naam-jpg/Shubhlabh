require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const path = require('path')

const app = express()
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.options('*', cors())
app.use(express.json({ limit: '10mb' }))

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/upload',    require('./routes/upload'))
app.use('/api/orders',     require('./routes/orders'))
app.use('/api/products',   require('./routes/products'))
app.use('/api/backdrops',  require('./routes/backdrops'))
app.use('/api/cutouts',    require('./routes/cutouts'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/reviews',        require('./routes/reviews'))
app.use('/api/inquiries',      require('./routes/inquiries'))
app.use('/api/other-products', require('./routes/otherProducts'))

app.get('/', (req, res) => res.json({ message: 'EventRent API running' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message, '\nRoute:', req.method, req.path)
  res.status(500).json({ error: err.message })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
    )
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1) })
