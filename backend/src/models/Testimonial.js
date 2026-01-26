const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: [true, 'Quote is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['en', 'gu', 'hi'],
    index: true
  },
  photo: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: false, // Requires approval
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  softDelete: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
testimonialSchema.index({ isActive: 1, displayOrder: 1, softDelete: 1 });
testimonialSchema.index({ language: 1, softDelete: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
