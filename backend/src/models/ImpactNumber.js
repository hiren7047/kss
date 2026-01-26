const mongoose = require('mongoose');

const impactNumberSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true
  },
  value: {
    type: Number,
    required: [true, 'Value is required'],
    min: 0
  },
  suffix: {
    type: String,
    default: '+'
  },
  icon: {
    type: String, // Icon name/identifier
    trim: true
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['en', 'gu', 'hi'],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
impactNumberSchema.index({ language: 1, isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('ImpactNumber', impactNumberSchema);
