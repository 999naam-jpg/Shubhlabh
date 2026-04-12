const router = require('express').Router()
const Category = require('../models/Category')

router.get('/',     async (req, res) => res.json(await Category.find()))
router.post('/',    async (req, res) => { try { res.status(201).json(await Category.create(req.body)) } catch(e){ res.status(400).json({error:e.message}) } })
router.patch('/:id', async (req, res) => { try { res.json(await Category.findByIdAndUpdate(req.params.id, req.body, {new:true})) } catch(e){ res.status(400).json({error:e.message}) } })
router.delete('/:id', async (req, res) => { try { await Category.findByIdAndDelete(req.params.id); res.json({ok:true}) } catch(e){ res.status(400).json({error:e.message}) } })

module.exports = router
