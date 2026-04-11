const mongoose = require('mongoose');

const invoiceEventSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'INVOICE_CREATED',
        'INVOICE_STATUS_UPDATED',
        'INVOICE_PAYMENT_UPDATED',
        'BLOCKCHAIN_SYNC_STARTED',
        'BLOCKCHAIN_SYNC_CONFIRMED',
        'BLOCKCHAIN_SYNC_FAILED',
      ],
      index: true,
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('InvoiceEvent', invoiceEventSchema);
