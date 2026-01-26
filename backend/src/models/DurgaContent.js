const mongoose = require('mongoose');

const durgaContentSchema = new mongoose.Schema({
  durgaId: {
    type: String,
    required: [true, 'Durga ID is required'],
    enum: ['saraswati', 'annapurna', 'ganga', 'kali', 'lakshmi'],
    unique: true,
    index: true
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['en', 'gu', 'hi'],
    default: 'en'
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  nameGujarati: {
    type: String,
    trim: true
  },
  meaning: {
    type: String,
    trim: true
  },
  meaningGujarati: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  descriptionLong: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  color: {
    type: String, // Gradient color code
    default: ''
  },
  activities: [{
    type: String,
    trim: true
  }],
  activitiesDetailed: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  impactNumbers: [{
    label: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    suffix: {
      type: String,
      default: '+'
    }
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  order: {
    type: Number,
    default: 0
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

// Indexes
durgaContentSchema.index({ durgaId: 1, softDelete: 1 });
durgaContentSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('DurgaContent', durgaContentSchema);
