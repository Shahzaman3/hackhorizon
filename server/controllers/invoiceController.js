const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateHash } = require('../utils/hash');
const { storeHash } = require('../utils/blockchain');

exports.createInvoice = async (req, res, next) => {
    try {
        const { invoiceNumber, sellerGstin, buyerGstin, amount, tax, date } = req.body;

        if (!invoiceNumber || !buyerGstin || !amount || !date) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const exactSellerGstin = sellerGstin || req.user.gstin;

        // 1. Duplicate Invoice Number Check
        const duplicate = await Invoice.findOne({ invoiceNumber });
        if (duplicate) {
            return res.status(400).json({ success: false, message: "Invoice number already exists" });
        }

        // 2. Hash Generation (Consistency)
        const invoiceHash = generateHash({
            invoiceNumber,
            sellerGstin: exactSellerGstin,
            buyerGstin,
            amount: Number(amount),
            date,
        });

        // 3. Prevent Hash Re-store
        const existingHash = await Invoice.findOne({ hash: invoiceHash });
        if (existingHash) {
            return res.status(409).json({ success: false, message: "Duplicate hash! This exact invoice data already exists on the ledger." });
        }

        // 4. Save Invoice with Pending Status
        const invoice = await Invoice.create({
            invoiceNumber,
            sellerId: req.user.id,
            sellerGstin: exactSellerGstin,
            buyerGstin,
            amount,
            tax,
            date,
            hash: invoiceHash,
            blockchainStatus: "pending",
            statusHistory: [{
                status: "pending",
                changedBy: req.user.id,
                note: "Invoice created"
            }]
        });
        
        // 5. Asynchronous Blockchain Storage (Wallet strictly handled on backend)
        storeHash(invoiceHash).then(async (receipt) => {
            if (receipt && receipt.status === 1) {
                invoice.blockchainStatus = "confirmed";
                await invoice.save();
                console.log(`[BLOCKCHAIN] Hash ${invoiceHash} successfully secured on-chain.`);
            }
        }).catch(async (err) => {
            console.error(`[BLOCKCHAIN] Failed to sync ${invoiceHash}`, err);
            invoice.blockchainStatus = "failed";
            await invoice.save();
        });

        // 6. Asynchronous Logging and Notification
        await AuditLog.create({
            userId: req.user.id,
            action: 'Created Invoice',
            entityType: 'Invoice',
            entityId: invoice._id,
            businessGstin: exactSellerGstin,
            details: `Invoice generated for ₹${amount}`
        });

        const targetUser = await User.findOne({ $or: [{ gstin: buyerGstin }, { 'businesses.gstin': buyerGstin }] });
        if (targetUser) {
            await Notification.create({
                userId: targetUser._id,
                title: 'New Invoice Received',
                message: `You received invoice ${invoiceNumber} from ${exactSellerGstin} for ₹${amount}`,
                type: 'info'
            });
        }
        
        // Return standard 201 immediately (No UI Freeze)
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
        const allowedGstins = [req.user.gstin];
        if (req.user.businesses && req.user.businesses.length > 0) {
            allowedGstins.push(...req.user.businesses.map(b => b.gstin));
        }

        const invoices = await Invoice.find({ buyerGstin: { $in: allowedGstins } }).sort({ createdAt: -1 });
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
        const isBuyer = invoice.buyerGstin === req.user.gstin || (req.user.businesses && req.user.businesses.some(b => b.gstin === invoice.buyerGstin));

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

        const isBuyer = invoice.buyerGstin === req.user.gstin || (req.user.businesses && req.user.businesses.some(b => b.gstin === invoice.buyerGstin));
        if (!isBuyer) {
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

        await AuditLog.create({
            userId: req.user.id,
            action: 'Updated Status',
            entityType: 'Invoice',
            entityId: invoice._id,
            details: `Status changed to ${status}`
        });

        const targetSeller = await User.findById(invoice.sellerId);
        if (targetSeller) {
            await Notification.create({
                userId: targetSeller._id,
                title: 'Invoice Status Updated',
                message: `Invoice ${invoice.invoiceNumber} status was changed to ${status} by the buyer.`,
                type: status === 'accepted' ? 'success' : 'warning'
            });
        }

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

        await AuditLog.create({
            userId: req.user.id,
            action: 'Updated Payment',
            entityType: 'Invoice',
            entityId: invoice._id,
            details: `Payment marked as ${paymentStatus}`
        });

        const targetBuyer = await User.findOne({ $or: [{ gstin: invoice.buyerGstin }, { 'businesses.gstin': invoice.buyerGstin }] });
        if (targetBuyer) {
            await Notification.create({
                userId: targetBuyer._id,
                title: 'Payment Status Updated',
                message: `Payment status for invoice ${invoice.invoiceNumber} successfully marked as ${paymentStatus}.`,
                type: paymentStatus === 'paid' ? 'success' : 'info'
            });
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};
