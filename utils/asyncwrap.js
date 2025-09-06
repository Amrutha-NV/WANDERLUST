module.exports = ((fn) => {
    return ((req, res, next) => {
        fn(req, res, next).catch(err => next(err)) //shorthand next()it will automatically pass the error to next
    })
})