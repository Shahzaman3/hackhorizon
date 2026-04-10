const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');

// Helper to format aggregation results
const extractFacet = (facetArr, defaultVal = {}) => (facetArr && facetArr[0]) ? facetArr[0] : defaultVal;

exports.getSellerDashboard = async (req, res, next) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user.id);

        // OPTIMIZATION: Single-pass aggregation using facets. 
        // This is significantly faster than multiple parallel count/aggregate calls.
        const dashboardData = await Invoice.aggregate([
            { $match: { sellerId } },
            {
                $facet: {
                    counts: [
                        {
                            $group: {
                                _id: null,
                                totalSent: { $sum: 1 },
                                accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
                                pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                                rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
                                paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
                                unpaid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "unpaid"] }, 1, 0] } },
                                totalBilled: { $sum: "$amount" }
                            }
                        }
                    ],
                    gst: [
                        { $match: { status: "accepted" } },
                        {
                            $group: {
                                _id: null,
                                totalCgst: { $sum: "$tax.cgst" },
                                totalSgst: { $sum: "$tax.sgst" },
                                totalIgst: { $sum: "$tax.igst" }
                            }
                        }
                    ],
                    received: [
                        { $match: { paymentStatus: "paid" } },
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ]
                }
            }
        ]);

        const c = extractFacet(dashboardData[0]?.counts, { totalSent: 0, accepted: 0, pending: 0, rejected: 0, paid: 0, unpaid: 0, totalBilled: 0 });
        const gst = extractFacet(dashboardData[0]?.gst, { totalCgst: 0, totalSgst: 0, totalIgst: 0 });
        const received = extractFacet(dashboardData[0]?.received, { total: 0 });

        const grandTotalGst = (gst.totalCgst || 0) + (gst.totalSgst || 0) + (gst.totalIgst || 0);

        res.status(200).json({
            success: true,
            data: {
                totalSent: c.totalSent,
                acceptedCount: c.accepted,
                pendingCount: c.pending,
                rejectedCount: c.rejected,
                paidCount: c.paid,
                unpaidCount: c.unpaid,
                gstCollected: { ...gst, grandTotalGst },
                totalBilled: c.totalBilled,
                totalReceived: received.total
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

        // OPTIMIZATION: Consolidated Facet-based aggregation for Buyer
        const dashboardData = await Invoice.aggregate([
            { $match: { buyerGstin: { $in: allowedGstins } } },
            {
                $facet: {
                    counts: [
                        {
                            $group: {
                                _id: null,
                                totalReceived: { $sum: 1 },
                                accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
                                pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                                rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
                                modified: { $sum: { $cond: [{ $eq: ["$status", "modified"] }, 1, 0] } },
                                totalAmountPayable: { $sum: { $cond: [{ $eq: ["$paymentStatus", "unpaid"] }, "$amount", 0] } },
                                totalAmountPaid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$amount", 0] } }
                            }
                        }
                    ],
                    gst: [
                        { $match: { status: "accepted" } },
                        {
                            $group: {
                                _id: null,
                                totalCgst: { $sum: "$tax.cgst" },
                                totalSgst: { $sum: "$tax.sgst" },
                                totalIgst: { $sum: "$tax.igst" }
                            }
                        }
                    ]
                }
            }
        ]);

        const c = extractFacet(dashboardData[0]?.counts, { totalReceived: 0, accepted: 0, pending: 0, rejected: 0, modified: 0, totalAmountPayable: 0, totalAmountPaid: 0 });
        const gst = extractFacet(dashboardData[0]?.gst, { totalCgst: 0, totalSgst: 0, totalIgst: 0 });
        const grandTotalGst = (gst.totalCgst || 0) + (gst.totalSgst || 0) + (gst.totalIgst || 0);

        res.status(200).json({
            success: true,
            data: {
                totalReceived: c.totalReceived,
                acceptedCount: c.accepted,
                pendingCount: c.pending,
                rejectedCount: c.rejected,
                modifiedCount: c.modified,
                gstPayable: { ...gst, grandTotalGst },
                totalAmountPayable: c.totalAmountPayable,
                totalAmountPaid: c.totalAmountPaid
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

        // OPTIMIZATION: Grouped aggregation to reduce network transfer
        const results = await Invoice.aggregate([
            { $match: matchQuery },
            {
                $facet: {
                    breakdown: [
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
                    ],
                    totals: [
                        {
                            $group: {
                                _id: null,
                                cgst: { $sum: "$tax.cgst" },
                                sgst: { $sum: "$tax.sgst" },
                                igst: { $sum: "$tax.igst" },
                                grand: { $sum: { $add: ["$tax.cgst", "$tax.sgst", "$tax.igst"] } }
                            }
                        }
                    ]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                breakdown: results[0]?.breakdown || [],
                totals: results[0]?.totals[0] || { cgst: 0, sgst: 0, igst: 0, grand: 0 }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getAuditLogs = async (req, res, next) => {
    try {
        // Limited selection to improve throughput
        const logs = await require('../models/AuditLog')
            .find({ userId: req.user.id })
            .select('details createdAt action')
            .sort({ createdAt: -1 })
            .limit(50); // Reduced limit for faster initial load
        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        next(err);
    }
};

exports.exportGstCSV = async (req, res, next) => {
    try {
        const allowedGstins = [req.user.gstin];
        if (req.user.businesses) req.user.businesses.forEach(b => allowedGstins.push(b.gstin));

        const query = req.user.role === 'seller' 
            ? { sellerGstin: { $in: allowedGstins } } 
            : { buyerGstin: { $in: allowedGstins } };
            
        // Use lean() for read-only aggregation to bypass Mongoose hydration
        const invoices = await Invoice.find(query).sort({ date: -1 }).lean();

        const header = "Invoice Number,Date,Counterparty GSTIN,Amount,CGST,SGST,IGST,Status\n";
        const rows = invoices.map(inv => {
            const cpGstin = req.user.role === 'seller' ? inv.buyerGstin : inv.sellerGstin;
            const dt = new Date(inv.date).toLocaleDateString('en-GB');
            return `${inv.invoiceNumber},${dt},${cpGstin},${inv.amount},${inv.tax.cgst},${inv.tax.sgst},${inv.tax.igst},${inv.status}`;
        }).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="InvoiceSync_GST_Return.csv"');
        res.status(200).send(header + rows);
    } catch (err) {
        next(err);
    }
};
