const router = require('express').Router()
const Product = require('../models/Product')

router.get('/',     async (req, res) => res.json(await Product.find()))
router.post('/',    async (req, res) => { try { res.status(201).json(await Product.create(req.body)) } catch(e){ res.status(400).json({error:e.message}) } })
router.patch('/:id', async (req, res) => { try { res.json(await Product.findByIdAndUpdate(req.params.id, req.body, {new:true})) } catch(e){ res.status(400).json({error:e.message}) } })
router.delete('/:id', async (req, res) => { try { await Product.findByIdAndDelete(req.params.id); res.json({ok:true}) } catch(e){ res.status(400).json({error:e.message}) } })

module.exports = router
