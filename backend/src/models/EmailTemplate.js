const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Template code is required'],
      trim: true,
      unique: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['transactional', 'newsletter'],
      default: 'newsletter',
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
    },
    bodyHtml: {
      type: String,
      required: [true, 'Email HTML body is required'],
      trim: true,
    },
    bodyText: {
      type: String,
      trim: true,
    },
    // Template variables like {{name}}, {{unsubscribeUrl}}
    variables: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    softDelete: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emailTemplateSchema.index({ status: 1, softDelete: 1 });
emailTemplateSchema.index({ code: 1, softDelete: 1 });
emailTemplateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);

