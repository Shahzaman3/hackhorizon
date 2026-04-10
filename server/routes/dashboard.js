const express = require('express');
const router = express.Router();
const { 
    getSellerDashboard, 
    getBuyerDashboard, 
    getGstSummary,
    getAuditLogs,
    exportGstCSV
} = require('../controllers/dashboardController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

// All routes are protected
router.use(verifyToken);

router.get('/seller', requireRole("seller"), getSellerDashboard);
router.get('/buyer', requireRole("buyer"), getBuyerDashboard);
router.get('/gst', getGstSummary);
router.get('/audit', getAuditLogs);
router.get('/export', exportGstCSV);

module.exports = router;
