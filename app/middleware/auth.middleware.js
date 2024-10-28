const jwt = require('jsonwebtoken');
const ApiError = require("../api-error");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new ApiError(401, "No token provided"));
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return next(new ApiError(401, "Token error"));
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return next(new ApiError(401, "Token malformatted"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new ApiError(401, "Invalid token"));
        }

        req.user = decoded;
        return next();
    });
};