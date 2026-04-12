const mongoose = require('mongoose')
module.exports = mongoose.model('Product', new mongoose.Schema({
  name: String, category: String, price: String,
  image: String, stock: String, quantity: Number,
  trending: Boolean, desc: String,
  photos: [String],
  includedProducts: [{ _id: String, name: String, image: String, price: String, _type: String }],
}))
