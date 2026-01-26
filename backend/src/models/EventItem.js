const mongoose = require('mongoose');

const eventItemSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0.01, 'Unit price must be greater than 0']
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  donatedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Donated quantity cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0.01, 'Total amount must be greater than 0']
  },
  donatedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Donated amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
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
eventItemSchema.index({ eventId: 1, softDelete: 1 });
eventItemSchema.index({ status: 1, softDelete: 1 });

// Virtual for remaining quantity
eventItemSchema.virtual('remainingQuantity').get(function() {
  return Math.max(0, this.totalQuantity - this.donatedQuantity);
});

// Virtual for remaining amount
eventItemSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.totalAmount - this.donatedAmount);
});

// Virtual for completion percentage
eventItemSchema.virtual('completionPercentage').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.min(100, (this.donatedAmount / this.totalAmount) * 100);
});

// Update status based on donations
eventItemSchema.methods.updateStatus = function() {
  if (this.donatedAmount >= this.totalAmount) {
    this.status = 'completed';
  } else if (this.donatedAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'pending';
  }
};

module.exports = mongoose.model('EventItem', eventItemSchema);
