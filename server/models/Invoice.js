const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    sellerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    sellerGstin: { 
        type: String, 
        uppercase: true 
    },
    buyerGstin: { 
        type: String, 
        required: true, 
        uppercase: true 
    },
    amount: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    tax: {
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 }
    },
    date: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["pending", "accepted", "rejected", "modified"], 
        default: "pending" 
    },
    paymentStatus: { 
        type: String, 
        enum: ["paid", "unpaid"], 
        default: "unpaid" 
    },
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String, default: "" }
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    hash: {
        type: String,
        default: null
    },
    blockchainStatus: {
        type: String,
        enum: ["pending", "confirmed", "failed"],
        default: "pending"
    },
    blockchainTxHash: {
        type: String,
        default: null
    },
    blockchainBlockNumber: {
        type: Number,
        default: null
    },
    blockchainConfirmedAt: {
        type: Date,
        default: null
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field: totalTax
invoiceSchema.virtual('totalTax').get(function() {
    return (this.tax.cgst || 0) + (this.tax.sgst || 0) + (this.tax.igst || 0);
});

module.exports = mongoose.model('Invoice', invoiceSchema);
