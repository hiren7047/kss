const walletService = require('../services/walletService');

/**
 * Get wallet summary
 */
const getWalletSummary = async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletSummary();

    res.status(200).json({
      success: true,
      data: wallet
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWalletSummary
};


