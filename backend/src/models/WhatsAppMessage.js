const mongoose = require('mongoose');

const whatsAppMessageSchema = new mongoose.Schema({
  // Template reference (if sent from template)
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppMessageTemplate',
    default: null
  },
  // Recipient information
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null
  },
  recipientMobile: {
    type: String,
    required: [true, 'Recipient mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  recipientName: {
    type: String,
    trim: true,
    default: ''
  },
  // Message content
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  // Media attachments
  pdf: {
    type: String,
    default: null,
    trim: true
  },
  img1: {
    type: String,
    default: null,
    trim: true
  },
  img2: {
    type: String,
    default: null,
    trim: true
  },
  // API response
  apiRequestId: {
    type: String,
    default: null
  },
  apiResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'scheduled'],
    default: 'pending',
    index: true
  },
  statusCode: {
    type: Number,
    default: null
  },
  errorMessage: {
    type: String,
    default: null,
    trim: true
  },
  // Scheduling
  scheduledFor: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  // Cost tracking
  msgCount: {
    type: Number,
    default: 0
  },
  msgCost: {
    type: Number,
    default: 0
  },
  // Batch information (if sent in bulk)
  batchId: {
    type: String,
    default: null,
    index: true
  },
  // Sent by
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
whatsAppMessageSchema.index({ status: 1, createdAt: -1 });
whatsAppMessageSchema.index({ recipientMobile: 1, createdAt: -1 });
whatsAppMessageSchema.index({ templateId: 1, createdAt: -1 });
whatsAppMessageSchema.index({ batchId: 1 });
whatsAppMessageSchema.index({ sentBy: 1, createdAt: -1 });

module.exports = mongoose.model('WhatsAppMessage', whatsAppMessageSchema);
