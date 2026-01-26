const Wallet = require('../models/Wallet');

/**
 * Get wallet summary
 */
const getWalletSummary = async () => {
  const wallet = await Wallet.getWallet();
  return wallet;
};

module.exports = {
  getWalletSummary
};


