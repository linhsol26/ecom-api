const {Category} = require('../models/category')
const express = require('express')
const router = express.Router()

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find()

    if (!categoryList) {
        res.status(500).json({
            error: 'Cannot find any category',
            success: false
        })
    }

    res.send(categoryList)
})

router.post('/', async (req, res) => {
    let category = new Category({
        ...req.body
    })

    category = await category.save()

    if (!category) {
        res.status(500).send('the category cannot be created.')
    }

    res.status(200).send(category)
})

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(404).json({
            message: 'category not found'
        })
    }
    res.status(200).send(category)
})

router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        ...req.body
    }, { new: true })

    if (!category) {
        res.status(404).json({
            message: 'category not found'
        })
    }
    res.status(200).send(category)

})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({
                success: true,
                message: 'Category has been removed.'
            })
        } else {
            return res.status(404).json({
                success: false,
                message: 'category not found'
            })
        }
    }).catch(e => {
        return res.status(400).json({
            success: false,
            error: e
        })
    })
})

module.exports = router