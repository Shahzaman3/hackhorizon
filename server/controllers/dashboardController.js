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
        const buyerGstin = req.user.gstin;

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
            Invoice.countDocuments({ buyerGstin }),
            Invoice.countDocuments({ buyerGstin, status: "accepted" }),
            Invoice.countDocuments({ buyerGstin, status: "pending" }),
            Invoice.countDocuments({ buyerGstin, status: "rejected" }),
            Invoice.countDocuments({ buyerGstin, status: "modified" }),
            // GST Payable
            Invoice.aggregate([
                { $match: { buyerGstin, status: "accepted" } },
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
                { $match: { buyerGstin, paymentStatus: "unpaid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Total Amount Paid
            Invoice.aggregate([
                { $match: { buyerGstin, paymentStatus: "paid" } },
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
            matchQuery.buyerGstin = req.user.gstin;
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
