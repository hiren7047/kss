const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { 
  createDonationSchema, 
  donationReportSchema,
  createDonationLinkSchema,
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema
} = require('../validators/donationValidator');

// Middleware to capture raw body for webhook signature verification
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// POST /donations
router.post(
  '/',
  authenticate,
  authorize('DONATION_CREATE'),
  validate(createDonationSchema),
  donationController.createDonation
);

// GET /donations
router.get(
  '/',
  authenticate,
  authorize('DONATION_READ'),
  validate(donationReportSchema, 'query'),
  donationController.getDonations
);

// GET /donations/report
router.get(
  '/report',
  authenticate,
  authorize('DONATION_READ'),
  validate(donationReportSchema, 'query'),
  donationController.getDonationReport
);

// GET /donations/member/:id
router.get(
  '/member/:id',
  authenticate,
  authorize('DONATION_READ'),
  donationController.getDonationsByMember
);

// POST /donations/links - Create donation link (must be before /:id)
router.post(
  '/links',
  authenticate,
  authorize('DONATION_CREATE'),
  validate(createDonationLinkSchema),
  donationController.createDonationLink
);

// GET /donations/links/:slug/event-items - Event + items for link (public, item-based donations)
router.get(
  '/links/:slug/event-items',
  donationController.getDonationLinkEventItems
);

// GET /donations/links/:slug - Get donation link (public, no auth required)
router.get(
  '/links/:slug',
  donationController.getDonationLinkBySlug
);

// GET /donations/links/durga/:durgaId - Get Durga donation link (public, no auth required)
router.get(
  '/links/durga/:durgaId',
  donationController.getDurgaDonationLink
);

// POST /donations/create-order - Create Razorpay order (public for donate page)
router.post(
  '/create-order',
  validate(createRazorpayOrderSchema),
  donationController.createRazorpayOrder
);

// POST /donations/verify-payment - Verify Razorpay payment (public for donate page)
router.post(
  '/verify-payment',
  validate(verifyRazorpayPaymentSchema),
  donationController.verifyRazorpayPayment
);

// POST /donations/webhook - Razorpay webhook (public, signature verified)
// Use raw body middleware for signature verification
router.post(
  '/webhook',
  rawBodyMiddleware,
  donationController.handleRazorpayWebhook
);

// GET /donations/transactions - Get payment transactions (admin)
router.get(
  '/transactions',
  authenticate,
  authorize('DONATION_READ'),
  donationController.getPaymentTransactions
);

// GET /donations/transactions/:id - Get payment transaction by ID (admin)
router.get(
  '/transactions/:id',
  authenticate,
  authorize('DONATION_READ'),
  donationController.getPaymentTransactionById
);

// GET /donations/:id/slip - Download donation slip PDF (before /:id)
router.get(
  '/:id/slip',
  authenticate,
  authorize('DONATION_READ'),
  donationController.downloadDonationSlip
);

// GET /donations/:id
router.get(
  '/:id',
  authenticate,
  authorize('DONATION_READ'),
  donationController.getDonationById
);

// DELETE /donations/:id
router.delete(
  '/:id',
  authenticate,
  authorize('DONATION_DELETE'),
  donationController.deleteDonation
);

module.exports = router;


