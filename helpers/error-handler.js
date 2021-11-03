function errorHandler(error, req, res, next) {
    if (error.name === "UnauthorizedError") {
        return res.status(401).json({
            message: "The user is not authorized."
        })
    } 

    if (error.name === "ValidationError") {
        return res.status(401).json({
            message: error
        })
    } 
    
    // server error
    return res.status(500).json({
        message: "error in the server"
    })
    
}

module.exports = errorHandler