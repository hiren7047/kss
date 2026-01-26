const Wallet = require('../models/Wallet');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');

/**
 * Update wallet balance after donation
 * @param {Number} amount - Donation amount
 */
const updateWalletAfterDonation = async (amount) => {
  const wallet = await Wallet.getWallet();
  wallet.totalDonations += amount;
  await wallet.updateBalance();
  return wallet;
};

/**
 * Update wallet balance after expense approval
 * @param {Number} amount - Expense amount
 */
const updateWalletAfterExpense = async (amount) => {
  const wallet = await Wallet.getWallet();
  wallet.totalExpenses += amount;
  await wallet.updateBalance();
  return wallet;
};

/**
 * Recalculate wallet balance (used when donation/expense is deleted)
 */
const recalculateWallet = async () => {

  const wallet = await Wallet.getWallet();

  // Calculate total donations (excluding soft deleted)
  const totalDonations = await Donation.aggregate([
    { $match: { softDelete: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Calculate total approved expenses (excluding soft deleted)
  const totalExpenses = await Expense.aggregate([
    { $match: { softDelete: false, approvalStatus: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  wallet.totalDonations = totalDonations[0]?.total || 0;
  wallet.totalExpenses = totalExpenses[0]?.total || 0;
  await wallet.updateBalance();

  return wallet;
};

module.exports = {
  updateWalletAfterDonation,
  updateWalletAfterExpense,
  recalculateWallet
};

