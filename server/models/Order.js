const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  id: String, name: String, price: String,
  image: String, source: String, qty: Number,
})

module.exports = mongoose.model('Order', new mongoose.Schema({
  orderId:      { type: String, unique: true },
  userId:       String,
  orderType:    { type: String, default: 'rental', enum: ['rental', 'decoration'] },
  status:       { type: String, default: 'Pending' },
  returnStatus: String,
  customer:     mongoose.Schema.Types.Mixed,
  items:        [itemSchema],
  total:        Number,
  deposit:      { type: Number, default: 0 },
  balance:      Number,
  discount:     { type: Number, default: 0 },
  discountType: String,
  discountNote: String,
  orderDone:    { type: Boolean, default: false },
  pickupDone:   { type: Boolean, default: false },
  editHistory:  { type: Array, default: [] },
  lastEditedAt: String,
}, { timestamps: true }))
