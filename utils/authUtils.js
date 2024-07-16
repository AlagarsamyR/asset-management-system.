// authUtils.js

const jwt = require('jsonwebtoken');

function getTokenFromCookies(req) {
    const token = req.cookies.token;
    return token;
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null; // Token is invalid
    }
}

module.exports = { getTokenFromCookies, verifyToken };
