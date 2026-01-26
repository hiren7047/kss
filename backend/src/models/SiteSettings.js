const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  organizationName: {
    en: {
      type: String,
      trim: true
    },
    gu: {
      type: String,
      trim: true
    },
    hi: {
      type: String,
      trim: true
    }
  },
  tagline: {
    en: {
      type: String,
      trim: true
    },
    gu: {
      type: String,
      trim: true
    },
    hi: {
      type: String,
      trim: true
    }
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    whatsapp: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      en: {
        type: String,
        trim: true
      },
      gu: {
        type: String,
        trim: true
      },
      hi: {
        type: String,
        trim: true
      }
    },
    officeHours: {
      monSat: {
        type: String,
        trim: true
      },
      sunday: {
        type: String,
        trim: true
      }
    },
    mapEmbedUrl: {
      type: String
    }
  },
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },
  paymentInfo: {
    upiId: {
      type: String,
      trim: true
    },
    bankAccount: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true
    },
    taxInfo: {
      type: String,
      trim: true
    }
  },
  donationAmounts: {
    type: [Number],
    default: [500, 1000, 2500, 5000, 10000, 25000]
  },
  seoSettings: {
    defaultTitle: {
      type: String,
      trim: true
    },
    defaultDescription: {
      type: String,
      trim: true
    },
    defaultKeywords: {
      type: String,
      trim: true
    },
    ogImage: {
      type: String
    },
    favicon: {
      type: String
    }
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one document exists
siteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
