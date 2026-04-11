const express = require('express');
const router = express.Router();
const { 
    createInvoice, 
    getSentInvoices, 
    getReceivedInvoices, 
    getInvoiceById, 
    getInvoiceBlockchainRecord,
    getInvoiceEvents,
    updateStatus, 
    updatePaymentStatus 
} = require('../controllers/invoiceController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const { writeLimiter } = require('../middleware/rateLimit');

// All routes are protected
router.use(verifyToken);

router.post('/', writeLimiter, requireRole("seller"), createInvoice);
router.get('/sent', requireRole("seller"), getSentInvoices);
router.get('/received', requireRole("buyer"), getReceivedInvoices);
router.get('/:id/blockchain', getInvoiceBlockchainRecord);
router.get('/:id/events', getInvoiceEvents);
router.get('/:id', getInvoiceById);
router.patch('/:id/status', writeLimiter, requireRole("buyer"), updateStatus);
router.patch('/:id/payment', writeLimiter, requireRole("seller"), updatePaymentStatus);

module.exports = router;
