const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      enum: ['en', 'gu', 'hi'],
      default: 'en',
      index: true,
    },
    isSubscribed: {
      type: Boolean,
      default: true,
      index: true,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ['mainsite', 'admin'],
      default: 'mainsite',
    },
  },
  {
    timestamps: true,
  }
);

newsletterSubscriberSchema.index({ isSubscribed: 1, language: 1 });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);

