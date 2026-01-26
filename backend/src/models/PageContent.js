const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  pageId: {
    type: String,
    required: [true, 'Page ID is required'],
    enum: ['home', 'about', 'contact', 'donate', 'volunteer', 'durga', 'events', 'gallery'],
    index: true
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['en', 'gu', 'hi'],
    index: true
  },
  sections: [{
    sectionId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    content: {
      type: String, // Rich text/HTML content
      trim: true
    },
    imageUrl: {
      type: String
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  metaTags: {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    keywords: {
      type: String,
      trim: true
    },
    ogImage: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  updatedBy: {
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

// Compound index for efficient queries
pageContentSchema.index({ pageId: 1, language: 1, softDelete: 1 });
pageContentSchema.index({ status: 1, softDelete: 1 });

// Ensure unique pageId + language combination
pageContentSchema.index({ pageId: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('PageContent', pageContentSchema);
