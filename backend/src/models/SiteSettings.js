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
    },
    whatsappCommunity: {
      type: String,
      trim: true
    },
    telegram: {
      type: String,
      trim: true
    },
    linkedin: {
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
  governance: {
    governingBody: [
      {
        name: { type: String, trim: true },
        designation: { type: String, trim: true },
        photoUrl: { type: String, trim: true },
        bio: { type: String, trim: true },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
      }
    ],
    signatories: [
      {
        name: { type: String, trim: true },
        designation: { type: String, trim: true },
        signatureImageUrl: { type: String, trim: true },
        stampImageUrl: { type: String, trim: true },
        useForDonationReceipt: { type: Boolean, default: false },
        useFor80GCertificate: { type: Boolean, default: false },
        useForVolunteerCertificate: { type: Boolean, default: false },
        useForAppreciationLetter: { type: Boolean, default: false }
      }
    ],
    defaults: {
      donationReceiptSignatoryId: {
        type: mongoose.Schema.Types.ObjectId
      },
      eightyGSignatoryId: {
        type: mongoose.Schema.Types.ObjectId
      },
      volunteerCertificateSignatoryId: {
        type: mongoose.Schema.Types.ObjectId
      },
      appreciationLetterSignatoryId: {
        type: mongoose.Schema.Types.ObjectId
      }
    }
  },
  branding: {
    logos: {
      primaryLogoUrl: { type: String, trim: true },
      secondaryLogoUrl: { type: String, trim: true },
      emblemUrl: { type: String, trim: true }
    },
    colors: {
      primaryColor: { type: String, trim: true },
      secondaryColor: { type: String, trim: true },
      accentColor: { type: String, trim: true },
      backgroundColor: { type: String, trim: true }
    },
    media: {
      defaultHeroImageUrl: { type: String, trim: true }
    }
  },
  financeSettings: {
    receiptNumbering: {
      prefix: { type: String, trim: true },
      paddingLength: { type: Number, default: 4 },
      includeFinancialYear: { type: Boolean, default: true },
      financialYearFormat: {
        type: String,
        enum: ['YYYY-YY', 'YY-YY'],
        default: 'YYYY-YY'
      }
    },
    financialYear: {
      startMonth: { type: Number, min: 1, max: 12, default: 4 }
    },
    receiptPreferences: {
      showNgoPanOnReceipt: { type: Boolean, default: true },
      donorPanMandatory: { type: Boolean, default: false },
      donorAddressMandatory: { type: Boolean, default: false },
      donorEmailMandatory: { type: Boolean, default: true },
      defaultReceiptFooter: { type: String, trim: true },
      eightyGNote: { type: String, trim: true }
    },
    donationPreferences: {
      minimumOnlineAmount: { type: Number, default: 0 },
      defaultPurpose: { type: String, trim: true }
    },
    qrCode: {
      imageUrl: { type: String, trim: true }
    }
  },
  communicationSettings: {
    email: {
      fromName: { type: String, trim: true },
      fromEmail: { type: String, trim: true },
      replyToEmail: { type: String, trim: true },
      defaultFooter: { type: String, trim: true },
      notifications: {
        newDonationEmailToAdmin: { type: Boolean, default: true },
        monthlyDonationSummaryToDirector: { type: Boolean, default: false },
        newVolunteerRegistrationToAdmin: { type: Boolean, default: true },
        newContactEnquiryToAdmin: { type: Boolean, default: true }
      }
    },
    whatsapp: {
      templateLanguage: {
        type: String,
        enum: ['en', 'gu', 'hi'],
        default: 'en'
      },
      autoMessages: {
        donationThankYou: { type: Boolean, default: false },
        eventReminderToVolunteers: { type: Boolean, default: false },
        postEventThanksToVolunteers: { type: Boolean, default: false }
      }
    },
    inAppNotifications: {
      lowWalletBalance: { type: Boolean, default: true },
      highValueDonation: { type: Boolean, default: true },
      newExpensePendingApproval: { type: Boolean, default: true },
      volunteerWorkPendingReview: { type: Boolean, default: true },
      thresholds: {
        lowWalletAmount: { type: Number, default: 0 },
        highDonationAmount: { type: Number, default: 0 }
      }
    }
  },
  systemPreferences: {
    defaultLanguage: {
      type: String,
      enum: ['en', 'gu', 'hi'],
      default: 'en'
    },
    timezone: { type: String, trim: true },
    dateFormat: {
      type: String,
      enum: ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'],
      default: 'DD-MM-YYYY'
    },
    numberFormat: {
      type: String,
      enum: ['en-IN', 'en-US'],
      default: 'en-IN'
    },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    require2FAForSuperAdmins: { type: Boolean, default: false },
    privacy: {
      showDonorNamesPublicly: { type: Boolean, default: true },
      showDonationAmountsPublicly: { type: Boolean, default: false }
    }
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
