const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate, authorize } = require('../middlewares/auth');

// GET /wallet/summary
router.get(
  '/summary',
  authenticate,
  authorize('WALLET_READ'),
  walletController.getWalletSummary
);

module.exports = router;


