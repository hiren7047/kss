const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  totalDonations: {
    type: Number,
    default: 0,
    min: 0
  },
  totalExpenses: {
    type: Number,
    default: 0,
    min: 0
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  restrictedFunds: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure only one wallet document exists
walletSchema.statics.getWallet = async function() {
  let wallet = await this.findOne();
  if (!wallet) {
    wallet = await this.create({});
  }
  return wallet;
};

// Update wallet balance
walletSchema.methods.updateBalance = function() {
  this.availableBalance = this.totalDonations - this.totalExpenses - this.restrictedFunds;
  return this.save();
};

module.exports = mongoose.model('Wallet', walletSchema);


