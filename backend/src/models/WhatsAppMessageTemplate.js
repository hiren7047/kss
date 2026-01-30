const mongoose = require('mongoose');

const whatsAppMessageTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Template title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Optional media attachments
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
  // Template variables that can be replaced (e.g., {{name}}, {{amount}})
  variables: {
    type: [String],
    default: []
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  // Soft delete
  softDelete: {
    type: Boolean,
    default: false,
    index: true
  },
  // Created/Updated by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
whatsAppMessageTemplateSchema.index({ status: 1, softDelete: 1 });
whatsAppMessageTemplateSchema.index({ name: 1, softDelete: 1 });
whatsAppMessageTemplateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WhatsAppMessageTemplate', whatsAppMessageTemplateSchema);
