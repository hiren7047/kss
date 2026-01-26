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
    twitter: Joi.string().uri().allow('', null).optional()
  }).optional(),
  paymentInfo: Joi.object({
    upiId: Joi.string().trim().allow('', null).optional(),
    bankAccount: Joi.string().trim().allow('', null).optional(),
    bankName: Joi.string().trim().allow('', null).optional(),
    ifscCode: Joi.string().trim().allow('', null).optional(),
    taxInfo: Joi.string().trim().allow('', null).optional()
  }).optional(),
  donationAmounts: Joi.array().items(Joi.number().positive()).optional(),
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
