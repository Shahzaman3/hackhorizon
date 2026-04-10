const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res, next) => {
    try {
        const { invoiceNumber, buyerGstin, amount, tax, date } = req.body;

        if (!invoiceNumber || !buyerGstin || !amount || !date) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const duplicate = await Invoice.findOne({ invoiceNumber });
        if (duplicate) {
            return res.status(400).json({ success: false, message: "Invoice number already exists" });
        }

        const invoice = await Invoice.create({
            invoiceNumber,
            sellerId: req.user.id,
            sellerGstin: req.user.gstin,
            buyerGstin,
            amount,
            tax,
            date,
            statusHistory: [{
                status: "pending",
                changedBy: req.user.id,
                note: "Invoice created"
            }]
        });

        res.status(201).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};

exports.getSentInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: invoices });
    } catch (err) {
        next(err);
    }
};

exports.getReceivedInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.find({ buyerGstin: req.user.gstin }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: invoices });
    } catch (err) {
        next(err);
    }
};

exports.getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        const isSeller = invoice.sellerId.toString() === req.user.id;
        const isBuyer = invoice.buyerGstin === req.user.gstin;

        if (!isSeller && !isBuyer) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;
        const validStatuses = ["accepted", "rejected", "modified"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        if (invoice.buyerGstin !== req.user.gstin) {
            return res.status(403).json({ success: false, message: "Access denied. Only the buyer can update status." });
        }

        invoice.status = status;
        invoice.statusHistory.push({
            status,
            changedAt: new Date(),
            changedBy: req.user.id,
            note: note || ""
        });

        await invoice.save();
        res.status(200).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};

exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentStatus } = req.body;
        const validPaymentStatuses = ["paid", "unpaid"];

        if (!validPaymentStatuses.includes(paymentStatus)) {
            return res.status(400).json({ success: false, message: "Invalid payment status" });
        }

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        if (invoice.sellerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Access denied. Only the seller can update payment status." });
        }

        invoice.paymentStatus = paymentStatus;
        await invoice.save();

        res.status(200).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};
