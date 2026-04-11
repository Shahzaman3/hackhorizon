const Invoice = require('../models/Invoice');
const GstReturnArtifact = require('../models/GstReturnArtifact');
const mongoose = require('mongoose');
const { realtimeBus } = require('../utils/realtimeBus');
const { normalizeGstin } = require('../utils/gstin');
const { emitRealtimeEvent } = require('../utils/realtimeBus');

// Helper to format aggregation results
const extractFacet = (facetArr, defaultVal = {}) => (facetArr && facetArr[0]) ? facetArr[0] : defaultVal;

const getAllowedGstins = (user) => {
    const allowed = new Set();

    if (user?.gstin) {
        allowed.add(normalizeGstin(user.gstin));
    }
    if (Array.isArray(user?.businesses)) {
        user.businesses.forEach((b) => {
            if (b?.gstin) {
                allowed.add(normalizeGstin(b.gstin));
            }
        });
    }

    return Array.from(allowed);
};

const parsePeriod = (queryOrBody) => {
    const now = new Date();
    const yearRaw = Number(queryOrBody?.year || now.getUTCFullYear());
    const monthRaw = Number(queryOrBody?.month || (now.getUTCMonth() + 1));

    if (!Number.isInteger(yearRaw) || yearRaw < 2000 || yearRaw > 2100) {
        return { error: 'Invalid year. Use a value between 2000 and 2100.' };
    }
    if (!Number.isInteger(monthRaw) || monthRaw < 1 || monthRaw > 12) {
        return { error: 'Invalid month. Use values from 1 to 12.' };
    }

    const from = new Date(Date.UTC(yearRaw, monthRaw - 1, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(yearRaw, monthRaw, 1, 0, 0, 0, 0));

    return { year: yearRaw, month: monthRaw, from, to };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildReconciliation = (lineItems) => {
    const totals = {
        mismatchInvoices: 0,
        unconfirmedBlockchainCount: 0,
        unpaidInvoiceCount: 0,
        nonPositiveTaxCount: 0,
        missingCounterpartyCount: 0,
    };

    lineItems.forEach((row) => {
        const flags = row.flags || [];
        if (flags.length > 0) {
            totals.mismatchInvoices += 1;
        }
        if (flags.includes('UNCONFIRMED_BLOCKCHAIN')) {
            totals.unconfirmedBlockchainCount += 1;
        }
        if (flags.includes('UNPAID_INVOICE')) {
            totals.unpaidInvoiceCount += 1;
        }
        if (flags.includes('NON_POSITIVE_TAX')) {
            totals.nonPositiveTaxCount += 1;
        }
        if (flags.includes('MISSING_COUNTERPARTY_GSTIN')) {
            totals.missingCounterpartyCount += 1;
        }
    });

    const base = lineItems.length || 1;
    const weightedIssueRatio = (
        (totals.unconfirmedBlockchainCount * 0.35) +
        (totals.unpaidInvoiceCount * 0.35) +
        (totals.nonPositiveTaxCount * 0.2) +
        (totals.missingCounterpartyCount * 0.1)
    ) / base;

    const confidenceScore = Math.round(clamp(100 - (weightedIssueRatio * 100), 0, 100));
    const riskLevel = confidenceScore >= 85 ? 'low' : confidenceScore >= 65 ? 'medium' : 'high';

    return {
        confidenceScore,
        riskLevel,
        ...totals,
    };
};

const buildReturnPayload = (role, invoices) => {
    const lineItems = invoices.map((inv) => {
        const cgst = Number(inv.tax?.cgst || 0);
        const sgst = Number(inv.tax?.sgst || 0);
        const igst = Number(inv.tax?.igst || 0);
        const totalTax = cgst + sgst + igst;
        const counterpartyGstin = role === 'seller' ? inv.buyerGstin : inv.sellerGstin;
        const flags = [];

        if (!counterpartyGstin) {
            flags.push('MISSING_COUNTERPARTY_GSTIN');
        }
        if (inv.blockchainStatus !== 'confirmed') {
            flags.push('UNCONFIRMED_BLOCKCHAIN');
        }
        if (inv.paymentStatus !== 'paid') {
            flags.push('UNPAID_INVOICE');
        }
        if (totalTax <= 0) {
            flags.push('NON_POSITIVE_TAX');
        }

        return {
            invoiceId: inv._id,
            invoiceNumber: inv.invoiceNumber,
            date: inv.date,
            counterpartyGstin,
            taxableValue: Number(inv.amount || 0),
            cgst,
            sgst,
            igst,
            totalTax,
            grossAmount: Number(inv.amount || 0) + totalTax,
            status: inv.status,
            paymentStatus: inv.paymentStatus,
            blockchainStatus: inv.blockchainStatus,
            flags,
        };
    });

    const summary = lineItems.reduce(
        (acc, row) => {
            acc.totalInvoices += 1;
            acc.taxableValue += row.taxableValue;
            acc.totalCgst += row.cgst;
            acc.totalSgst += row.sgst;
            acc.totalIgst += row.igst;
            acc.grandTax += row.totalTax;
            acc.grossAmount += row.grossAmount;
            return acc;
        },
        {
            totalInvoices: 0,
            taxableValue: 0,
            totalCgst: 0,
            totalSgst: 0,
            totalIgst: 0,
            grandTax: 0,
            grossAmount: 0,
        }
    );

    const reconciliation = buildReconciliation(lineItems);

    if (role === 'seller') {
        return {
            summary,
            reconciliation,
            sections: {
                gstr1_b2b_outward: lineItems,
                gstr1_tax_liability: {
                    cgst: summary.totalCgst,
                    sgst: summary.totalSgst,
                    igst: summary.totalIgst,
                    total: summary.grandTax,
                },
            },
        };
    }

    return {
        summary,
        reconciliation,
        sections: {
            gstr2b_inward_itc: lineItems,
            gstr3b_itc_summary: {
                cgst: summary.totalCgst,
                sgst: summary.totalSgst,
                igst: summary.totalIgst,
                total: summary.grandTax,
            },
        },
    };
};

exports.generateGstReturn = async (req, res, next) => {
    try {
        const period = parsePeriod(req.body || {});
        if (period.error) {
            return res.status(400).json({ success: false, message: period.error });
        }

        const allowedGstins = getAllowedGstins(req.user);
        if (allowedGstins.length === 0) {
            return res.status(400).json({ success: false, message: 'No GSTIN configured for this account' });
        }

        const baseQuery = {
            status: 'accepted',
            date: { $gte: period.from, $lt: period.to },
        };

        if (req.user.role === 'seller') {
            baseQuery.sellerGstin = { $in: allowedGstins };
        } else {
            baseQuery.buyerGstin = { $in: allowedGstins };
        }

        const invoices = await Invoice.find(baseQuery)
            .sort({ date: -1 })
            .select('invoiceNumber date sellerGstin buyerGstin amount tax status paymentStatus blockchainStatus')
            .lean();

        const payload = buildReturnPayload(req.user.role, invoices);
        const latest = await GstReturnArtifact.findOne({
            userId: req.user.id,
            role: req.user.role,
            'period.year': period.year,
            'period.month': period.month,
        }).sort({ version: -1 });

        const artifact = await GstReturnArtifact.create({
            userId: req.user.id,
            role: req.user.role,
            period: {
                year: period.year,
                month: period.month,
                from: period.from,
                to: period.to,
            },
            gstins: allowedGstins,
            version: (latest?.version || 0) + 1,
            summary: payload.summary,
            reconciliation: payload.reconciliation,
            sections: payload.sections,
            generatedAt: new Date(),
        });

        emitRealtimeEvent({
            type: 'gst.return_generated',
            userIds: [req.user.id],
            gstins: allowedGstins,
            returnId: artifact._id.toString(),
            period: { year: period.year, month: period.month, version: artifact.version },
        });

        return res.status(201).json({ success: true, data: artifact });
    } catch (err) {
        next(err);
    }
};

exports.getGstReturnHistory = async (req, res, next) => {
    try {
        const period = parsePeriod(req.query || {});
        const query = {
            userId: req.user.id,
            role: req.user.role,
        };

        if (!period.error && req.query?.year && req.query?.month) {
            query['period.year'] = period.year;
            query['period.month'] = period.month;
        }

        const rows = await GstReturnArtifact.find(query)
            .sort({ 'period.year': -1, 'period.month': -1, version: -1 })
            .select('role period gstins version summary reconciliation generatedAt createdAt')
            .limit(24)
            .lean();

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};

exports.getGstReturnById = async (req, res, next) => {
    try {
        const artifact = await GstReturnArtifact.findById(req.params.id).lean();
        if (!artifact) {
            return res.status(404).json({ success: false, message: 'GST return artifact not found' });
        }

        if (artifact.userId.toString() !== req.user.id || artifact.role !== req.user.role) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        return res.status(200).json({ success: true, data: artifact });
    } catch (err) {
        next(err);
    }
};

exports.downloadGstReturnCsv = async (req, res, next) => {
    try {
        const artifact = await GstReturnArtifact.findById(req.params.id).lean();
        if (!artifact) {
            return res.status(404).json({ success: false, message: 'GST return artifact not found' });
        }

        if (artifact.userId.toString() !== req.user.id || artifact.role !== req.user.role) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const rows = artifact.role === 'seller'
            ? (artifact.sections?.gstr1_b2b_outward || [])
            : (artifact.sections?.gstr2b_inward_itc || []);

        const header = [
            'Invoice Number',
            'Date',
            'Counterparty GSTIN',
            'Taxable Value',
            'CGST',
            'SGST',
            'IGST',
            'Total Tax',
            'Gross Amount',
            'Status',
            'Payment Status',
            'Blockchain Status',
            'Flags',
        ].join(',');

        const csvRows = rows.map((row) => {
            const date = row.date ? new Date(row.date).toISOString().slice(0, 10) : '';
            return [
                row.invoiceNumber,
                date,
                row.counterpartyGstin,
                row.taxableValue,
                row.cgst,
                row.sgst,
                row.igst,
                row.totalTax,
                row.grossAmount,
                row.status,
                row.paymentStatus,
                row.blockchainStatus,
                Array.isArray(row.flags) ? row.flags.join('|') : '',
            ].join(',');
        });

        const csv = [header, ...csvRows].join('\n');
        const fileName = `GST_Return_${artifact.period.year}_${String(artifact.period.month).padStart(2, '0')}_v${artifact.version}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.status(200).send(csv);
    } catch (err) {
        next(err);
    }
};

exports.streamDashboardEvents = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
    }

    const userId = req.user.id;
    const gstins = new Set();

    if (req.user.gstin) {
        gstins.add(normalizeGstin(req.user.gstin));
    }
    if (Array.isArray(req.user.businesses)) {
        req.user.businesses.forEach((business) => {
            if (business?.gstin) {
                gstins.add(normalizeGstin(business.gstin));
            }
        });
    }

    const send = (eventName, payload) => {
        res.write(`event: ${eventName}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    send('connected', { success: true, message: 'Realtime stream connected' });

    const listener = (event) => {
        const userMatch = Array.isArray(event.userIds) && event.userIds.includes(userId);
        const gstinMatch = Array.isArray(event.gstins) && event.gstins.some((g) => gstins.has(normalizeGstin(g)));

        if (!userMatch && !gstinMatch) {
            return;
        }

        send('invoice-event', event);
    };

    realtimeBus.on('invoice-event', listener);

    const heartbeat = setInterval(() => {
        res.write(': ping\n\n');
    }, 25000);

    req.on('close', () => {
        clearInterval(heartbeat);
        realtimeBus.off('invoice-event', listener);
    });
};

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
