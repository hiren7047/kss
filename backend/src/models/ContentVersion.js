const mongoose = require('mongoose');

const contentVersionSchema = new mongoose.Schema({
  contentType: {
    type: String,
    required: [true, 'Content type is required'],
    enum: ['page', 'durga', 'event', 'testimonial', 'gallery'],
    index: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Content ID is required'],
    index: true
  },
  version: {
    type: Number,
    required: [true, 'Version number is required']
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Snapshot of content at this version
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changeReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
contentVersionSchema.index({ contentType: 1, contentId: 1, version: 1 });

module.exports = mongoose.model('ContentVersion', contentVersionSchema);
