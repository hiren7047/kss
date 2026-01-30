const Joi = require('joi');

const updateSiteSettingsSchema = Joi.object({
  organizationName: Joi.object({
    en: Joi.string().trim().allow('', null).optional(),
    gu: Joi.string().trim().allow('', null).optional(),
    hi: Joi.string().trim().allow('', null).optional()
  }).optional(),
  tagline: Joi.object({
    en: Joi.string().trim().allow('', null).optional(),
    gu: Joi.string().trim().allow('', null).optional(),
    hi: Joi.string().trim().allow('', null).optional()
  }).optional(),
  contactInfo: Joi.object({
    phone: Joi.string().trim().allow('', null).optional(),
    whatsapp: Joi.string().trim().allow('', null).optional(),
    email: Joi.string().email().allow('', null).optional(),
    address: Joi.object({
      en: Joi.string().trim().allow('', null).optional(),
      gu: Joi.string().trim().allow('', null).optional(),
      hi: Joi.string().trim().allow('', null).optional()
    }).optional(),
    officeHours: Joi.object({
      monSat: Joi.string().trim().allow('', null).optional(),
      sunday: Joi.string().trim().allow('', null).optional()
    }).optional(),
    mapEmbedUrl: Joi.string().uri().allow('', null).optional()
  }).optional(),
  socialMedia: Joi.object({
    facebook: Joi.string().uri().allow('', null).optional(),
    instagram: Joi.string().uri().allow('', null).optional(),
    youtube: Joi.string().uri().allow('', null).optional(),
    twitter: Joi.string().uri().allow('', null).optional(),
    whatsappCommunity: Joi.string().uri().allow('', null).optional(),
    telegram: Joi.string().uri().allow('', null).optional(),
    linkedin: Joi.string().uri().allow('', null).optional()
  }).optional(),
  paymentInfo: Joi.object({
    upiId: Joi.string().trim().allow('', null).optional(),
    bankAccount: Joi.string().trim().allow('', null).optional(),
    bankName: Joi.string().trim().allow('', null).optional(),
    ifscCode: Joi.string().trim().allow('', null).optional(),
    taxInfo: Joi.string().trim().allow('', null).optional()
  }).optional(),
  donationAmounts: Joi.array().items(Joi.number().positive()).optional(),
  governance: Joi.object({
    governingBody: Joi.array().items(
      Joi.object({
        name: Joi.string().trim().required(),
        designation: Joi.string().trim().allow('', null).optional(),
        photoUrl: Joi.string().uri().allow('', null).optional(),
        bio: Joi.string().trim().allow('', null).optional(),
        order: Joi.number().integer().min(0).optional(),
        isActive: Joi.boolean().optional()
      })
    ).optional(),
    signatories: Joi.array().items(
      Joi.object({
        name: Joi.string().trim().required(),
        designation: Joi.string().trim().allow('', null).optional(),
        signatureImageUrl: Joi.string().uri().allow('', null).optional(),
        stampImageUrl: Joi.string().uri().allow('', null).optional(),
        useForDonationReceipt: Joi.boolean().optional(),
        useFor80GCertificate: Joi.boolean().optional(),
        useForVolunteerCertificate: Joi.boolean().optional(),
        useForAppreciationLetter: Joi.boolean().optional()
      })
    ).optional(),
    defaults: Joi.object({
      donationReceiptSignatoryId: Joi.string().hex().length(24).allow(null).optional(),
      eightyGSignatoryId: Joi.string().hex().length(24).allow(null).optional(),
      volunteerCertificateSignatoryId: Joi.string().hex().length(24).allow(null).optional(),
      appreciationLetterSignatoryId: Joi.string().hex().length(24).allow(null).optional()
    }).optional()
  }).optional(),
  branding: Joi.object({
    logos: Joi.object({
      primaryLogoUrl: Joi.string().uri().allow('', null).optional(),
      secondaryLogoUrl: Joi.string().uri().allow('', null).optional(),
      emblemUrl: Joi.string().uri().allow('', null).optional()
    }).optional(),
    colors: Joi.object({
      primaryColor: Joi.string().trim().pattern(/^#?[0-9A-Fa-f]{3,8}$/).allow('', null).optional(),
      secondaryColor: Joi.string().trim().pattern(/^#?[0-9A-Fa-f]{3,8}$/).allow('', null).optional(),
      accentColor: Joi.string().trim().pattern(/^#?[0-9A-Fa-f]{3,8}$/).allow('', null).optional(),
      backgroundColor: Joi.string().trim().pattern(/^#?[0-9A-Fa-f]{3,8}$/).allow('', null).optional()
    }).optional(),
    media: Joi.object({
      defaultHeroImageUrl: Joi.string().uri().allow('', null).optional()
    }).optional()
  }).optional(),
  financeSettings: Joi.object({
    receiptNumbering: Joi.object({
      prefix: Joi.string().trim().allow('', null).optional(),
      paddingLength: Joi.number().integer().min(1).max(8).optional(),
      includeFinancialYear: Joi.boolean().optional(),
      financialYearFormat: Joi.string().valid('YYYY-YY', 'YY-YY').optional()
    }).optional(),
    financialYear: Joi.object({
      startMonth: Joi.number().integer().min(1).max(12).optional()
    }).optional(),
    receiptPreferences: Joi.object({
      showNgoPanOnReceipt: Joi.boolean().optional(),
      donorPanMandatory: Joi.boolean().optional(),
      donorAddressMandatory: Joi.boolean().optional(),
      donorEmailMandatory: Joi.boolean().optional(),
      defaultReceiptFooter: Joi.string().trim().allow('', null).optional(),
      eightyGNote: Joi.string().trim().allow('', null).optional()
    }).optional(),
    donationPreferences: Joi.object({
      minimumOnlineAmount: Joi.number().min(0).optional(),
      defaultPurpose: Joi.string().trim().allow('', null).optional()
    }).optional(),
    qrCode: Joi.object({
      imageUrl: Joi.string().uri().allow('', null).optional()
    }).optional()
  }).optional(),
  communicationSettings: Joi.object({
    email: Joi.object({
      fromName: Joi.string().trim().allow('', null).optional(),
      fromEmail: Joi.string().email().allow('', null).optional(),
      replyToEmail: Joi.string().email().allow('', null).optional(),
      defaultFooter: Joi.string().trim().allow('', null).optional(),
      notifications: Joi.object({
        newDonationEmailToAdmin: Joi.boolean().optional(),
        monthlyDonationSummaryToDirector: Joi.boolean().optional(),
        newVolunteerRegistrationToAdmin: Joi.boolean().optional(),
        newContactEnquiryToAdmin: Joi.boolean().optional()
      }).optional()
    }).optional(),
    whatsapp: Joi.object({
      templateLanguage: Joi.string().valid('en', 'gu', 'hi').optional(),
      autoMessages: Joi.object({
        donationThankYou: Joi.boolean().optional(),
        eventReminderToVolunteers: Joi.boolean().optional(),
        postEventThanksToVolunteers: Joi.boolean().optional()
      }).optional()
    }).optional(),
    inAppNotifications: Joi.object({
      lowWalletBalance: Joi.boolean().optional(),
      highValueDonation: Joi.boolean().optional(),
      newExpensePendingApproval: Joi.boolean().optional(),
      volunteerWorkPendingReview: Joi.boolean().optional(),
      thresholds: Joi.object({
        lowWalletAmount: Joi.number().min(0).optional(),
        highDonationAmount: Joi.number().min(0).optional()
      }).optional()
    }).optional()
  }).optional(),
  systemPreferences: Joi.object({
    defaultLanguage: Joi.string().valid('en', 'gu', 'hi').optional(),
    timezone: Joi.string().trim().allow('', null).optional(),
    dateFormat: Joi.string().valid('DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD').optional(),
    numberFormat: Joi.string().valid('en-IN', 'en-US').optional(),
    sessionTimeoutMinutes: Joi.number().integer().min(5).max(720).optional(),
    require2FAForSuperAdmins: Joi.boolean().optional(),
    privacy: Joi.object({
      showDonorNamesPublicly: Joi.boolean().optional(),
      showDonationAmountsPublicly: Joi.boolean().optional()
    }).optional()
  }).optional(),
  seoSettings: Joi.object({
    defaultTitle: Joi.string().trim().allow('', null).optional(),
    defaultDescription: Joi.string().trim().allow('', null).optional(),
    defaultKeywords: Joi.string().trim().allow('', null).optional(),
    ogImage: Joi.string().uri().allow('', null).optional(),
    favicon: Joi.string().uri().allow('', null).optional()
  }).optional(),
  maintenanceMode: Joi.boolean().optional(),
  maintenanceMessage: Joi.string().trim().allow('', null).optional()
});

module.exports = {
  updateSiteSettingsSchema
};
