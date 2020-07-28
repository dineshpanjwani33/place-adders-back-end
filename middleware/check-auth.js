const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {

    if(req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1]; //Bearer Authorization
        if (!token) {
            throw new Error('Authorization failed!')
        }
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decodedData.userId }
        next()
    }
    catch (err) {
        return next(
            new HttpError('Authorization failed!', 403)
        )
    }
}