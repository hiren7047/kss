const siteSettingsService = require('../services/siteSettingsService');

const getSettings = async (req, res, next) => {
  try {
    const settings = await siteSettingsService.getSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const settings = await siteSettingsService.updateSettings(
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Site settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await siteSettingsService.getPublicSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getPublicSettings
};
