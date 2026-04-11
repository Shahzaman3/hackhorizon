const mongoose = require('mongoose');

const gstReturnArtifactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['seller', 'buyer'],
      required: true,
      index: true,
    },
    period: {
      year: { type: Number, required: true },
      month: { type: Number, required: true },
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    gstins: {
      type: [String],
      default: [],
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    summary: {
      totalInvoices: { type: Number, default: 0 },
      taxableValue: { type: Number, default: 0 },
      totalCgst: { type: Number, default: 0 },
      totalSgst: { type: Number, default: 0 },
      totalIgst: { type: Number, default: 0 },
      grandTax: { type: Number, default: 0 },
      grossAmount: { type: Number, default: 0 },
    },
    reconciliation: {
      confidenceScore: { type: Number, default: 100 },
      riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
      mismatchInvoices: { type: Number, default: 0 },
      unconfirmedBlockchainCount: { type: Number, default: 0 },
      unpaidInvoiceCount: { type: Number, default: 0 },
      nonPositiveTaxCount: { type: Number, default: 0 },
      missingCounterpartyCount: { type: Number, default: 0 },
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

gstReturnArtifactSchema.index({ userId: 1, role: 1, 'period.year': 1, 'period.month': 1, version: -1 });

module.exports = mongoose.model('GstReturnArtifact', gstReturnArtifactSchema);
