const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    required: true,
    index: true
  },
  paymentMethod: {
    type: String
  },
  webhookEvents: [{
    event: {
      type: String,
      required: true
    },
    receivedAt: {
      type: Date,
      default: Date.now
    },
    payload: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  rawData: {
    type: mongoose.Schema.Types.Mixed
  },
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
paymentTransactionSchema.index({ createdAt: -1 });
paymentTransactionSchema.index({ status: 1, processed: 1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
