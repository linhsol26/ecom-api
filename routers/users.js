const {User} = require('../models/user')
require('dotenv').config()
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash')

    if (!userList) {
        res.status(500).json({
            error: 'Cannot find any user',
            success: false
        })
    }

    return res.send(userList)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash')

    if (!user) {
        res.status(404).json({
            message: 'user not found'
        })
    }
    res.status(200).send(user)
})

router.post('/register', async (req, res) => {
    let user = new User({
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        ...req.body
    })
   
    try {
        user = await user.save()
    } catch(e) {
        return res.status(400).json({
            error: e.message
        })
    }

    if (!user) {
        return res.status(500).send('the user cannot be created.')
    }

    return res.status(200).send(user)
})

router.post('/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    })

    if (!user) {
        return res.status(404).json({
            message: 'user not found'
        })
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const secretKey = process.env.SECRET_KEY
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
        }, secretKey, {
            expiresIn: '1d'
        })

        return res.status(200).json({
            email: user.email,
            token: token
        })
    } else {
        return res.status(400).send('email or password is wrong')
    }
})

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({
                success: true,
                message: 'User has been removed.'
            })
        } else {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            })
        }
    }).catch(e => {
        return res.status(400).json({
            success: false,
            error: e
        })
    })
})

router.put('/:id', async (req, res) => {

    const user = await User.findByIdAndUpdate(req.params.id, {
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        ...req.body
    }, { new: true })

    if (!user) {
        res.status(404).json({
            message: 'user not found'
        })
    }

    res.status(200).send(user)

})

module.exports = router