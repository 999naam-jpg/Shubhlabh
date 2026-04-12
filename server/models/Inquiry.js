const mongoose = require('mongoose')
module.exports = mongoose.model('Inquiry', new mongoose.Schema({
  name: String, email: String, phone: String,
  event: String, date: String, message: String,
  read: { type: Boolean, default: false },
}, { timestamps: true }))
