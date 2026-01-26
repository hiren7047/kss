const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  budget: {
    type: Number,
    default: 0,
    min: [0, 'Budget cannot be negative']
  },
  targetAmount: {
    type: Number,
    default: 0,
    min: [0, 'Target amount cannot be negative'],
    index: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event manager is required']
  },
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'cancelled'],
    default: 'planned'
  },
  mainsiteDisplay: {
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    featuredImage: {
      type: String
    },
    shortDescription: {
      type: String,
      trim: true
    },
    longDescription: {
      type: String,
      trim: true
    },
    location: {
      name: {
        type: String,
        trim: true
      },
      address: {
        type: String,
        trim: true
      },
      mapUrl: {
        type: String
      }
    },
    time: {
      type: String, // Display time string
      trim: true
    },
    registrationRequired: {
      type: Boolean,
      default: false
    },
    registrationLink: {
      type: String
    },
    galleryImages: [{
      type: String
    }],
    tags: [{
      type: String,
      trim: true
    }]
  },
  translations: {
    en: {
      title: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    },
    gu: {
      title: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    },
    hi: {
      title: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }
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
eventSchema.index({ startDate: 1, softDelete: 1 });
eventSchema.index({ status: 1, softDelete: 1 });
eventSchema.index({ managerId: 1, softDelete: 1 });
eventSchema.index({ 'mainsiteDisplay.isPublic': 1, softDelete: 1 });

module.exports = mongoose.model('Event', eventSchema);


