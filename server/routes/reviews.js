const router = require('express').Router()
const Review = require('../models/Review')

router.get('/',     async (req, res) => res.json(await Review.find().sort({ createdAt: -1 })))
router.post('/',    async (req, res) => { try { res.status(201).json(await Review.create(req.body)) } catch(e){ res.status(400).json({error:e.message}) } })
router.patch('/:id', async (req, res) => { try { res.json(await Review.findByIdAndUpdate(req.params.id, req.body, {new:true})) } catch(e){ res.status(400).json({error:e.message}) } })
router.delete('/:id', async (req, res) => { try { await Review.findByIdAndDelete(req.params.id); res.json({ok:true}) } catch(e){ res.status(400).json({error:e.message}) } })

module.exports = router
