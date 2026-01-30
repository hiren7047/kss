const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailTemplate',
      default: null,
    },
    templateCode: {
      type: String,
      trim: true,
      index: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
      trim: true,
    },
    meta: {
      type: Object,
      default: {},
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emailLogSchema.index({ status: 1, sentAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);

