const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated via JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'invoice-sync-secret');
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = verifyToken;
