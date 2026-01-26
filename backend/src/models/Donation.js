const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  purpose: {
    type: String,
    enum: ['event', 'general', 'emergency'],
    required: [true, 'Purpose is required'],
    default: 'general'
  },
  paymentMode: {
    type: String,
    enum: ['upi', 'cash', 'bank', 'razorpay'],
    required: [true, 'Payment mode is required']
  },
  transactionId: {
    type: String,
    trim: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  eventItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventItem',
    default: null,
    index: true
  },
  donationType: {
    type: String,
    enum: ['general', 'item_specific', 'expense_specific'],
    default: 'general'
  },
  itemQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Item quantity cannot be negative']
  },
  receiptNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  // Razorpay fields
  razorpayOrderId: {
    type: String,
    trim: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    trim: true,
    index: true
  },
  razorpaySignature: {
    type: String,
    trim: true
  },
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  // Anonymous donation flag
  isAnonymous: {
    type: Boolean,
    default: false
  },
  // Donation link reference (if created via link)
  donationLinkSlug: {
    type: String,
    trim: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for public donations
  },
  softDelete: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
donationSchema.index({ createdAt: -1, softDelete: 1 });
donationSchema.index({ memberId: 1, softDelete: 1 });
donationSchema.index({ eventId: 1, softDelete: 1 });
donationSchema.index({ purpose: 1, softDelete: 1 });

module.exports = mongoose.model('Donation', donationSchema);


