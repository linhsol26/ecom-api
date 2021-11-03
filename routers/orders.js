const { Order } = require('../models/order')
const { OrderItem } = require('../models/order-item')
const express = require('express')
const router = express.Router()

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1})

    if (!orderList) {
        res.status(500).json({
            error: 'Cannot find any order',
            success: false
        })
    }

    res.send(orderList)
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name').populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            populate: 'category'
        }
    })

    if (!order) {
        res.status(500).json({
            error: 'Cannot find any order',
            success: false
        })
    }

    res.send(order)
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalsales: {
                    $sum: '$totalPrice'
                }
            }
        }
    ])

    if (!totalSales) {
        res.status(400).json({
            error: 'totalsales cannot be calculated',
            success: false
        })
    }

    res.status(200).send({
        totalSales: totalSales.pop().totalsales // use the last of array -> pop _id
    })
})

router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments()

    if (!orderCount) {
        res.status(500).json({
            success: false
        })
    }

    res.send({
        orderCount: orderCount
    })
})

router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({
        user: req.params.userid
    }).populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            populate: 'category'
        }
    }).sort({'dateOrdered': -1})

    if (!userOrderList) {
        res.status(500).json({
            error: 'Cannot find any order',
            success: false
        })
    }

    res.send({
        orders: userOrderList
    })
})

router.post('/', async (req, res) => {

    const orderItemsId = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save()

        return newOrderItem._id
    }))

    const orderItemsIdsResolved = await orderItemsId

    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async orderItemsId => {
            const orderItem = await OrderItem.findById(orderItemsId).populate('product', 'price')
            const totalPrice = (orderItem.product.price ?? 0) * orderItem.quantity
            return totalPrice
        })
    )

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrices.reduce((a, b) => a + b, 0),
        user: req.body.user
    })

    order = await order.save()

    if (!order) {
        res.status(500).send('the order cannot be created.')
    }

    res.status(200).send(order)
})

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    }, { new: true })

    if (!order) {
        res.status(404).json({
            message: 'order not found'
        })
    }
    res.status(200).send(order)

})

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({
                success: true,
                message: 'order has been removed.'
            })
        } else {
            return res.status(404).json({
                success: false,
                message: 'order not found'
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