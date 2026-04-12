const mongoose = require('mongoose')
module.exports = mongoose.model('Review', new mongoose.Schema({
  orderId: String, name: String, event: String,
  rating: Number, text: String, userPhoto: String,
  decorationPhotos: [String],
}, { timestamps: true }))
