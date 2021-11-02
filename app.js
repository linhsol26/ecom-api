const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv/config')

app.use(cors())
app.options('*', cors())

// middleware
// ?????
app.use(bodyParser.json())
app.use(morgan('tiny'))

const api = process.env.API_URL

// routers
const productsRouter = require('./routers/products')
const categoriesRouter = require('./routers/categories')
const ordersRouter = require('./routers/orders')
const usersRouter = require('./routers/users')

app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/orders`, ordersRouter)
app.use(`${api}/users`, usersRouter)

app.listen(3000, () => {
    console.log('server is running http://localhost:3000')
})

const Product = require('./models/product')

mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'ecom-database'
        })
        .then(() => {
            console.log('Database is ready.')
        })
        .catch((e) => {
            console.log(e)
        })