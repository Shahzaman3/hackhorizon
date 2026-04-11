const express = require('express');
const router = express.Router();
const { 
    getSellerDashboard, 
    getBuyerDashboard, 
    getGstSummary,
    getAuditLogs,
    exportGstCSV,
    streamDashboardEvents,
    generateGstReturn,
    getGstReturnHistory,
    getGstReturnById,
    downloadGstReturnCsv
} = require('../controllers/dashboardController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const { writeLimiter } = require('../middleware/rateLimit');

// All routes are protected
router.use(verifyToken);

router.get('/seller', requireRole("seller"), getSellerDashboard);
router.get('/buyer', requireRole("buyer"), getBuyerDashboard);
router.get('/gst', getGstSummary);
router.get('/audit', getAuditLogs);
router.get('/export', exportGstCSV);
router.get('/stream', streamDashboardEvents);
router.post('/returns/generate', writeLimiter, generateGstReturn);
router.get('/returns/history', getGstReturnHistory);
router.get('/returns/:id', getGstReturnById);
router.get('/returns/:id/export.csv', downloadGstReturnCsv);

module.exports = router;
