const mongoose = require('mongoose')
module.exports = mongoose.model('Backdrop', new mongoose.Schema({
  name: String, price: String, image: String,
  stock: String, quantity: Number, trending: Boolean, desc: String,
  photos: [String],
}))
