const {Product} = require('../models/product')
const express = require('express')
const { Category } = require('../models/category')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValidFile = FILE_TYPE_MAP[file.mimetype]
        cb(isValidFile ? null : new Error('invalid image type'), 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-')
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
const uploadOptions = multer({ storage: storage })

// get all or filter by categories ?categories=catId,anotherCatId
router.get(`/`, async (req, res) => {

    let filter = {}

    if (req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate(
        'category'
    )

    if (!productList) {
        res.status(500).json({
            error: 'Cannot find any product',
            success: false
        })
    }

    res.send(productList)
})

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate(
        'category'
    )

    if (!product) {
        res.status(500).json({
            error: 'Cannot find product',
            success: false
        })
    }

    res.send(product)
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments()

    if (!productCount) {
        res.status(500).json({
            success: false
        })
    }

    res.send({
        productCount: productCount
    })
})

router.get(`/get/featured/:limit`, async (req, res) => {

    const limit = req.params.limit ? req.params.limit : 0

    const productList = await Product.find({
        isFeatured: true
    }).limit(+limit)

    if (!productList) {
        res.status(500).json({
            success: false
        })
    }

    res.send(productList)
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    if (req.body.category === "") {
        return res.status(400).send('Invalid Category')
    }

    const category = await Category.findById(req.body.category)

    if (!category) {
        return res.status(400).send('Invalid Category')
    }

    const file = req.file
    if (!file) {
        return res.status(400).send('No image in the request')
    }

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    let product = new Product({
        image: `${basePath}${fileName}`,
        ...req.body
    })

    try {
        product = await product.save()
    } catch(e) {
        return res.status(400).json({
            error: e.message
        })
    }

    if (!product) {
        return res.status(500).send('the product cannot be created.')
    }

    return res.status(200).send(product)

})

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }

    // if (!mongoose.isValidObjectId(req.body.category)) {
    //     return res.status(400).send('Invalid Category')
    // }

    // const category = await Category.findById(req.body.category)

    // if (!category) {
    //     return res.status(400).send('Invalid Category')
    // }

    const product = await Product.findByIdAndUpdate(req.params.id, {
        ...req.body
    }, { new: true })

    if (!product) {
        res.status(404).json({
            message: 'product not found'
        })
    }
    res.status(200).send(product)

})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }

    const files = req.files
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    let imagesPaths = []

    if (files) {
        files.map(f => {
            imagesPaths.push(`${basePath}${f.filename}`)
        })
    }

    const product = await Product.findByIdAndUpdate(req.params.id, {
        images: imagesPaths
    }, { new: true })

    if (!product) {
        res.status(404).json({
            message: 'product not found'
        })
    }
    res.status(200).send(product)
})

router.delete('/:id', (req, res) => {
    mongoose.isValidObjectId(req.params.id)

    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({
                success: true,
                message: 'product has been removed.'
            })
        } else {
            return res.status(404).json({
                success: false,
                message: 'product not found'
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