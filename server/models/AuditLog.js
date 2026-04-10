const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    action: { 
        type: String, 
        required: true,
        enum: ['Created Invoice', 'Updated Status', 'Updated Payment', 'Discarded Invoice', 'Created Request', 'Fulfilled Request']
    },
    entityType: {
        type: String,
        required: true,
        enum: ['Invoice', 'InvoiceRequest']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'entityType'
    },
    businessGstin: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ""
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create index for fast retrieval by user or entity
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
