const Invoice = require('../models/Invoice');
const { generateHash } = require('../utils/hash');
const { storeHash } = require('../utils/blockchain');

exports.createInvoice = async (req, res, next) => {
    try {
        const { invoiceNumber, buyerGstin, amount, tax, date } = req.body;

        if (!invoiceNumber || !buyerGstin || !amount || !date) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // 1. Duplicate Invoice Number Check
        const duplicate = await Invoice.findOne({ invoiceNumber });
        if (duplicate) {
            return res.status(400).json({ success: false, message: "Invoice number already exists" });
        }

        // 2. Hash Generation (Consistency)
        const invoiceHash = generateHash({
            invoiceNumber,
            sellerGstin: req.user.gstin,
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
            sellerId: req.user.userId,
            sellerGstin: req.user.gstin,
            buyerGstin,
            amount,
            tax,
            date,
            hash: invoiceHash,
            blockchainStatus: "pending",
            statusHistory: [{
                status: "pending",
                changedBy: req.user.userId,
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

        // 6. Return standard 201 immediately (No UI Freeze)
        res.status(201).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};

exports.getSentInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.find({ sellerId: req.user.userId }).sort({ createdAt: -1 });
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

        const isSeller = invoice.sellerId.toString() === req.user.userId;
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
            changedBy: req.user.userId,
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

        if (invoice.sellerId.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied. Only the seller can update payment status." });
        }

        invoice.paymentStatus = paymentStatus;
        await invoice.save();

        res.status(200).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};
