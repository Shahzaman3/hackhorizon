const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      unique: true,
      index: true,
    },
    invoiceHash: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
      index: true,
    },
    txHash: {
      type: String,
      default: null,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    contractAddress: {
      type: String,
      default: null,
    },
    rpcUrl: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);
