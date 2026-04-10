const InvoiceRequest = require('../models/InvoiceRequest');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createRequest = async (req, res, next) => {
    try {
        const { sellerGstin, note } = req.body;

        if (!sellerGstin) {
            return res.status(400).json({ success: false, message: "Seller GSTIN is required" });
        }

        const request = await InvoiceRequest.create({
            buyerId: req.user.id,
            buyerGstin: req.user.gstin,
            sellerGstin,
            note: note || "",
            status: "pending"
        });

        await AuditLog.create({
            userId: req.user.id,
            action: 'Created Request',
            entityType: 'InvoiceRequest',
            entityId: request._id,
            businessGstin: req.user.gstin,
            details: `Requested invoice from ${sellerGstin}`
        });

        const targetSeller = await User.findOne({ $or: [{ gstin: sellerGstin }, { 'businesses.gstin': sellerGstin }] });
        if (targetSeller) {
            await Notification.create({
                userId: targetSeller._id,
                title: 'New Invoice Request',
                message: `You have received a new generic invoice request.`,
                type: 'warning'
            });
        }

        res.status(201).json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};

exports.getBuyerRequests = async (req, res, next) => {
    try {
        const requests = await InvoiceRequest.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        next(err);
    }
};

exports.getSellerIncomingRequests = async (req, res, next) => {
    try {
        const allowedGstins = [req.user.gstin];
        if (req.user.businesses && req.user.businesses.length > 0) {
            allowedGstins.push(...req.user.businesses.map(b => b.gstin));
        }
        
        const requests = await InvoiceRequest.find({ sellerGstin: { $in: allowedGstins } }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        next(err);
    }
};

exports.fulfillRequest = async (req, res, next) => {
    try {
        const request = await InvoiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const allowedGstins = [req.user.gstin];
        if (req.user.businesses && req.user.businesses.length > 0) {
            allowedGstins.push(...req.user.businesses.map(b => b.gstin));
        }

        if (req.user.gstin && !allowedGstins.includes(request.sellerGstin)) {
            return res.status(403).json({ success: false, message: "Access denied. Only the targeted seller can fulfill this request." });
        }

        request.status = "fulfilled";
        await request.save();

        await AuditLog.create({
            userId: req.user.id,
            action: 'Fulfilled Request',
            entityType: 'InvoiceRequest',
            entityId: request._id,
            details: `Request fulfilled for buyer ${request.buyerGstin}`
        });

        const targetBuyer = await User.findById(request.buyerId);
        if (targetBuyer) {
            await Notification.create({
                userId: targetBuyer._id,
                title: 'Request Fulfilled',
                message: `Your specific invoice request to ${request.sellerGstin} was officially fulfilled.`,
                type: 'success'
            });
        }

        res.status(200).json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};
