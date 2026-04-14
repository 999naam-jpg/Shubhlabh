const router = require('express').Router()
const Product = require('../models/Product')
const { calcStock } = require('../utils/stockHelper')

router.get('/',     async (req, res) => res.json(await Product.find()))
router.post('/',    async (req, res) => { try { const d = req.body; d.stock = calcStock(d.quantity); res.status(201).json(await Product.create(d)) } catch(e){ res.status(400).json({error:e.message}) } })
router.patch('/:id', async (req, res) => { try { const d = req.body; if (d.quantity !== undefined) d.stock = calcStock(d.quantity); res.json(await Product.findByIdAndUpdate(req.params.id, d, {new:true})) } catch(e){ res.status(400).json({error:e.message}) } })
router.delete('/:id', async (req, res) => { try { await Product.findByIdAndDelete(req.params.id); res.json({ok:true}) } catch(e){ res.status(400).json({error:e.message}) } })

module.exports = router
