const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, handleGoogleCallback, getCurrentUser, switchRole, updateGstin, logout } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`, session: false }),
    handleGoogleCallback
);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.post('/switch-role', verifyToken, switchRole);
router.put('/gstin', verifyToken, updateGstin);
router.post('/logout', logout);

module.exports = router;
