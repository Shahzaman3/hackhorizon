const express = require('express');
const router = express.Router();
const { 
    createRequest, 
    getBuyerRequests, 
    getSellerIncomingRequests, 
    fulfillRequest 
} = require('../controllers/requestController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const { writeLimiter } = require('../middleware/rateLimit');

// All routes are protected
router.use(verifyToken);

router.post('/', writeLimiter, requireRole("buyer"), createRequest);
router.get('/mine', requireRole("buyer"), getBuyerRequests);
router.get('/incoming', requireRole("seller"), getSellerIncomingRequests);
router.patch('/:id/fulfill', writeLimiter, requireRole("seller"), fulfillRequest);

module.exports = router;
