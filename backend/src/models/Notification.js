const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'DONATION_RECEIVED',
      'EXPENSE_PENDING',
      'EXPENSE_APPROVED',
      'EXPENSE_REJECTED',
      'MEMBER_REGISTERED',
      'VOLUNTEER_REGISTERED',
      'EVENT_CREATED',
      'EVENT_UPDATED',
      'LOW_WALLET_BALANCE',
      'FORM_SUBMISSION',
      'VOLUNTEER_WORK_SUBMITTED',
      'DOCUMENT_UPLOADED',
      'CONTACT_SUBMISSION',
      'SYSTEM_ALERT'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedType: {
    type: String,
    enum: ['DONATION', 'EXPENSE', 'MEMBER', 'EVENT', 'VOLUNTEER', 'FORM', 'DOCUMENT', 'CONTACT', null],
    default: null
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
