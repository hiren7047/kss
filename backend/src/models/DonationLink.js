const mongoose = require('mongoose');
const crypto = require('crypto');

const donationLinkSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    required: false,
    index: true,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Support Our Cause'
  },
  description: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    enum: ['event', 'general', 'emergency'],
    required: [true, 'Purpose is required'],
    default: 'general'
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  durgaId: {
    type: String,
    enum: ['saraswati', 'annapurna', 'ganga', 'kali', 'lakshmi', null],
    default: null,
    index: true
  },
  suggestedAmount: {
    type: Number,
    min: 0,
    default: null // Optional - if null, user can enter any amount
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null // If null, link never expires
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donationCount: {
    type: Number,
    default: 0
  },
  totalAmount: {
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

// Generate unique slug before saving
donationLinkSchema.pre('save', async function(next) {
  if (!this.slug) {
    let slug;
    let isUnique = false;
    
    while (!isUnique) {
      slug = crypto.randomBytes(8).toString('hex');
      try {
        const existing = await this.constructor.findOne({ slug });
        if (!existing) isUnique = true;
      } catch (e) {
        return next(e);
      }
    }
    
    this.slug = slug;
  }
  next();
});

// Indexes
donationLinkSchema.index({ createdAt: -1, softDelete: 1 });
donationLinkSchema.index({ purpose: 1, softDelete: 1 });
donationLinkSchema.index({ eventId: 1, softDelete: 1 });

module.exports = mongoose.model('DonationLink', donationLinkSchema);
