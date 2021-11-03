const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    shippingAddress1: {
        type: String,
        require: true
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        require: true
    },
    zip: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: true
    },
    status: {
        type: String,
        require: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number,
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

exports.Order = mongoose.model('Order', orderSchema)