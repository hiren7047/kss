const transparencyService = require('../services/transparencyService');

/**
 * Get public wallet summary
 */
const getPublicWalletSummary = async (req, res, next) => {
  try {
    const summary = await transparencyService.getPublicWalletSummary();
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public donations
 */
const getPublicDonations = async (req, res, next) => {
  try {
    const result = await transparencyService.getPublicDonations(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public expenses
 */
const getPublicExpenses = async (req, res, next) => {
  try {
    const result = await transparencyService.getPublicExpenses(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transparency summary (all data)
 */
const getTransparencySummary = async (req, res, next) => {
  try {
    const summary = await transparencyService.getTransparencySummary();
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicWalletSummary,
  getPublicDonations,
  getPublicExpenses,
  getTransparencySummary
};
