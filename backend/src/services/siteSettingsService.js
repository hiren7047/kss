const SiteSettings = require('../models/SiteSettings');
const { createAuditLog } = require('../utils/auditLogger');

const getSettings = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
};

const updateSettings = async (updateData, userId, ipAddress) => {
  let settings = await SiteSettings.findOne();
  
  if (!settings) {
    settings = await SiteSettings.create({
      ...updateData,
      updatedBy: userId
    });
  } else {
    const oldData = settings.toObject();
    settings.updatedBy = userId;
    Object.assign(settings, updateData);
    await settings.save();

    await createAuditLog({
      userId,
      action: 'UPDATE',
      module: 'SITE_SETTINGS',
      oldData,
      newData: settings.toObject(),
      ipAddress
    });
  }

  return settings;
};

const getPublicSettings = async () => {
  const settings = await getSettings();
  
  // Return only public-safe data
  return {
    branding: settings.branding,
    organizationName: settings.organizationName,
    tagline: settings.tagline,
    contactInfo: settings.contactInfo,
    socialMedia: settings.socialMedia,
    paymentInfo: settings.paymentInfo,
    donationAmounts: settings.donationAmounts || [500, 1000, 2500, 5000, 10000, 25000],
    seoSettings: settings.seoSettings
  };
};

module.exports = {
  getSettings,
  updateSettings,
  getPublicSettings
};
