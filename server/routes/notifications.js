const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { writeLimiter } = require('../middleware/rateLimit');

// All notification routes are intrinsically protected
router.use(verifyToken);

router.get('/', getNotifications);
router.patch('/read-all', writeLimiter, markAllAsRead);
router.patch('/:id/read', writeLimiter, markAsRead);

module.exports = router;
