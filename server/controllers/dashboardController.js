const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');

exports.getSellerDashboard = async (req, res, next) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user.id);

        const [
            totalSent,
            acceptedCount,
            pendingCount,
            rejectedCount,
            paidCount,
            unpaidCount,
            gstStats,
            billingStats,
            receivedStats
        ] = await Promise.all([
            Invoice.countDocuments({ sellerId }),
            Invoice.countDocuments({ sellerId, status: "accepted" }),
            Invoice.countDocuments({ sellerId, status: "pending" }),
            Invoice.countDocuments({ sellerId, status: "rejected" }),
            Invoice.countDocuments({ sellerId, paymentStatus: "paid" }),
            Invoice.countDocuments({ sellerId, paymentStatus: "unpaid" }),
            // GST Collected
            Invoice.aggregate([
                { $match: { sellerId, status: "accepted" } },
                {
                    $group: {
                        _id: null,
                        totalCgst: { $sum: "$tax.cgst" },
                        totalSgst: { $sum: "$tax.sgst" },
                        totalIgst: { $sum: "$tax.igst" }
                    }
                }
            ]),
            // Total Billed
            Invoice.aggregate([
                { $match: { sellerId } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Total Received
            Invoice.aggregate([
                { $match: { sellerId, paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const gst = gstStats[0] || { totalCgst: 0, totalSgst: 0, totalIgst: 0 };
        const grandTotalGst = (gst.totalCgst || 0) + (gst.totalSgst || 0) + (gst.totalIgst || 0);

        res.status(200).json({
            success: true,
            data: {
                totalSent,
                acceptedCount,
                pendingCount,
                rejectedCount,
                paidCount,
                unpaidCount,
                gstCollected: { ...gst, grandTotalGst },
                totalBilled: billingStats[0]?.total || 0,
                totalReceived: receivedStats[0]?.total || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getBuyerDashboard = async (req, res, next) => {
    try {
        const allowedGstins = [req.user.gstin];
        if (req.user.businesses && req.user.businesses.length > 0) {
            allowedGstins.push(...req.user.businesses.map(b => b.gstin));
        }

        const [
            totalReceived,
            acceptedCount,
            pendingCount,
            rejectedCount,
            modifiedCount,
            gstStats,
            payableStats,
            paidStats
        ] = await Promise.all([
            Invoice.countDocuments({ buyerGstin: { $in: allowedGstins } }),
            Invoice.countDocuments({ buyerGstin: { $in: allowedGstins }, status: "accepted" }),
            Invoice.countDocuments({ buyerGstin: { $in: allowedGstins }, status: "pending" }),
            Invoice.countDocuments({ buyerGstin: { $in: allowedGstins }, status: "rejected" }),
            Invoice.countDocuments({ buyerGstin: { $in: allowedGstins }, status: "modified" }),
            // GST Payable
            Invoice.aggregate([
                { $match: { buyerGstin: { $in: allowedGstins }, status: "accepted" } },
                {
                    $group: {
                        _id: null,
                        totalCgst: { $sum: "$tax.cgst" },
                        totalSgst: { $sum: "$tax.sgst" },
                        totalIgst: { $sum: "$tax.igst" }
                    }
                }
            ]),
            // Total Amount Payable
            Invoice.aggregate([
                { $match: { buyerGstin: { $in: allowedGstins }, paymentStatus: "unpaid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Total Amount Paid
            Invoice.aggregate([
                { $match: { buyerGstin: { $in: allowedGstins }, paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const gst = gstStats[0] || { totalCgst: 0, totalSgst: 0, totalIgst: 0 };
        const grandTotalGst = (gst.totalCgst || 0) + (gst.totalSgst || 0) + (gst.totalIgst || 0);

        res.status(200).json({
            success: true,
            data: {
                totalReceived,
                acceptedCount,
                pendingCount,
                rejectedCount,
                modifiedCount,
                gstPayable: { ...gst, grandTotalGst },
                totalAmountPayable: payableStats[0]?.total || 0,
                totalAmountPaid: paidStats[0]?.total || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getGstSummary = async (req, res, next) => {
    try {
        const matchQuery = { status: "accepted" };
        if (req.user.role === "seller") {
            matchQuery.sellerId = new mongoose.Types.ObjectId(req.user.id);
        } else {
            const allowedGstins = [req.user.gstin];
            if (req.user.businesses && req.user.businesses.length > 0) {
                allowedGstins.push(...req.user.businesses.map(b => b.gstin));
            }
            matchQuery.buyerGstin = { $in: allowedGstins };
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        matchQuery.date = { $gte: sixMonthsAgo };

        const summary = await Invoice.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    cgst: { $sum: "$tax.cgst" },
                    sgst: { $sum: "$tax.sgst" },
                    igst: { $sum: "$tax.igst" },
                    total: { $sum: { $add: ["$tax.cgst", "$tax.sgst", "$tax.igst"] } }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        const totals = await Invoice.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    cgst: { $sum: "$tax.cgst" },
                    sgst: { $sum: "$tax.sgst" },
                    igst: { $sum: "$tax.igst" },
                    grand: { $sum: { $add: ["$tax.cgst", "$tax.sgst", "$tax.igst"] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                breakdown: summary,
                totals: totals[0] || { cgst: 0, sgst: 0, igst: 0, grand: 0 }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getAuditLogs = async (req, res, next) => {
    try {
        const logs = await require('../models/AuditLog')
            .find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        next(err);
    }
};

exports.exportGstCSV = async (req, res, next) => {
    try {
        const allowedGstins = [];
        if (req.user.gstin) allowedGstins.push(req.user.gstin);
        if (req.user.businesses) {
            req.user.businesses.forEach(b => allowedGstins.push(b.gstin));
        }

        const query = req.user.role === 'seller' 
            ? { sellerGstin: { $in: allowedGstins } } 
            : { buyerGstin: { $in: allowedGstins } };
            
        const invoices = await require('../models/Invoice').find(query).sort({ date: -1 });

        const header = "Invoice Number,Date,Counterparty GSTIN,Amount,CGST,SGST,IGST,Status\n";
        const rows = invoices.map(inv => {
            const cpGstin = req.user.role === 'seller' ? inv.buyerGstin : inv.sellerGstin;
            const dt = new Date(inv.date).toLocaleDateString('en-GB');
            return `${inv.invoiceNumber},${dt},${cpGstin},${inv.amount},${inv.tax.cgst},${inv.tax.sgst},${inv.tax.igst},${inv.status}`;
        }).join('\n');
        
        const csv = header + rows;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="InvoiceSync_GST_Return.csv"');
        res.status(200).send(csv);
    } catch (err) {
        next(err);
    }
};
