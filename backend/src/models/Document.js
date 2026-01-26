const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['audit', 'utilization', 'event', 'legal', 'other']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
documentSchema.index({ category: 1 });
documentSchema.index({ visibility: 1 });
documentSchema.index({ createdAt: -1 });

// Virtual for uploadedAt (maps to createdAt for backward compatibility)
documentSchema.virtual('uploadedAt').get(function() {
  return this.createdAt;
});

module.exports = mongoose.model('Document', documentSchema);


