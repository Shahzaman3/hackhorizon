const InvoiceRequest = require('../models/InvoiceRequest');

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
        const requests = await InvoiceRequest.find({ sellerGstin: req.user.gstin }).sort({ createdAt: -1 });
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

        if (req.user.gstin && request.sellerGstin !== req.user.gstin) {
            return res.status(403).json({ success: false, message: "Access denied. Only the targeted seller can fulfill this request." });
        }

        request.status = "fulfilled";
        await request.save();

        res.status(200).json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};
