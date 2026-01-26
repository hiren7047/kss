const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['photo', 'video'],
    index: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  thumbnailUrl: {
    type: String
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['annapurna', 'ganga', 'kali', 'saraswati', 'events', 'general'],
    index: true
  },
  durgaId: {
    type: String,
    enum: ['saraswati', 'annapurna', 'ganga', 'kali', 'lakshmi']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
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
galleryItemSchema.index({ category: 1, softDelete: 1 });
galleryItemSchema.index({ isFeatured: 1, displayOrder: 1 });
galleryItemSchema.index({ eventId: 1, softDelete: 1 });
galleryItemSchema.index({ durgaId: 1, softDelete: 1 });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
