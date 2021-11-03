const expressJwt = require('express-jwt')

function authJwt() {
    const secretKey = process.env.SECRET_KEY
    const api = process.env.API_URL
    return expressJwt({
        secret: secretKey,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {
                // copy regular expression hi
                url: /\/api\/v1\/products(.*)/,
                method: ['GET', 'OPTIONS']
            },
            {
                // copy regular expression hi
                url: /\/api\/v1\/categories(.*)/,
                method: ['GET', 'OPTIONS']
            },
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
}

function isRevoked(req, payload, done) {
    if (payload.isAdmin) {
        done(null, true)
    }

    done()
} 

module.exports = authJwt()