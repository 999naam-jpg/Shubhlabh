const router = require('express').Router()
const Order = require('../models/Order')

router.get('/', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 })
  res.json(orders)
})

router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body)
    res.status(201).json(order)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(order)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

module.exports = router
