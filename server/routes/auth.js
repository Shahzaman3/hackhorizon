const express = require('express');
const passport = require('passport');
const router = express.Router();
const { getCurrentUser, switchRole, updateGstin, addBusiness, logout, register, login } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

// Local auth routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google', (req, res, next) => {
    const requestedRole = req.query.role === 'seller' ? 'seller' : 'buyer';
    req.session.oauthRole = requestedRole;
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login` }),
    async (req, res) => {
        const requestedRole = req.session?.oauthRole;
        if (req.session) {
            delete req.session.oauthRole;
        }

        if (requestedRole && req.user && req.user.role !== requestedRole) {
            req.user.role = requestedRole;
            try {
                await req.user.save();
            } catch (err) {
                console.error('Failed to persist requested OAuth role:', err);
            }
        }

        const finalRole = requestedRole || req.user.role;
        res.redirect(
            finalRole === 'buyer'
                ? `${process.env.CLIENT_URL || 'http://localhost:5173'}/buyer-dashboard`
                : `${process.env.CLIENT_URL || 'http://localhost:5173'}/seller-dashboard`
        );
    }
);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.post('/switch-role', verifyToken, switchRole);
router.put('/gstin', verifyToken, updateGstin);
router.post('/business', verifyToken, addBusiness);
router.post('/logout', logout);

module.exports = router;
