const mongoose = require('mongoose');

const eventExpensePlanSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  estimatedAmount: {
    type: Number,
    required: [true, 'Estimated amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  actualAmount: {
    type: Number,
    default: 0,
    min: [0, 'Actual amount cannot be negative']
  },
  plannedDate: {
    type: Date,
    required: [true, 'Planned date is required']
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    default: null // Link to actual expense when created
  },
  notes: {
    type: String,
    trim: true
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
eventExpensePlanSchema.index({ eventId: 1, softDelete: 1 });
eventExpensePlanSchema.index({ status: 1, softDelete: 1 });
eventExpensePlanSchema.index({ plannedDate: 1, softDelete: 1 });
eventExpensePlanSchema.index({ priority: 1, softDelete: 1 });

// Virtual for variance (difference between estimated and actual)
eventExpensePlanSchema.virtual('variance').get(function() {
  return this.actualAmount - this.estimatedAmount;
});

// Virtual for variance percentage
eventExpensePlanSchema.virtual('variancePercentage').get(function() {
  if (this.estimatedAmount === 0) return 0;
  return ((this.actualAmount - this.estimatedAmount) / this.estimatedAmount) * 100;
});

module.exports = mongoose.model('EventExpensePlan', eventExpensePlanSchema);
