const router = require('express').Router()
const Cutout = require('../models/Cutout')
const { calcStock } = require('../utils/stockHelper')

router.get('/',     async (req, res) => res.json(await Cutout.find()))
router.post('/',    async (req, res) => { try { const d = req.body; d.stock = calcStock(d.quantity); res.status(201).json(await Cutout.create(d)) } catch(e){ res.status(400).json({error:e.message}) } })
router.patch('/:id', async (req, res) => { try { const d = req.body; if (d.quantity !== undefined) d.stock = calcStock(d.quantity); res.json(await Cutout.findByIdAndUpdate(req.params.id, d, {new:true})) } catch(e){ res.status(400).json({error:e.message}) } })
router.delete('/:id', async (req, res) => { try { await Cutout.findByIdAndDelete(req.params.id); res.json({ok:true}) } catch(e){ res.status(400).json({error:e.message}) } })

module.exports = router
