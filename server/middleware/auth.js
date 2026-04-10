// Middleware to check if user is authenticated via Passport session
const verifyToken = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
    next();
};

module.exports = verifyToken;
