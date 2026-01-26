const donationService = require('../services/donationService');
const webhookController = require('./webhookController');

/**
 * Create donation
 */
const createDonation = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const donation = await donationService.createDonation(req.body, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all donations
 */
const getDonations = async (req, res, next) => {
  try {
    const result = await donationService.getDonations(req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get donation by ID
 */
const getDonationById = async (req, res, next) => {
  try {
    const donation = await donationService.getDonationById(req.params.id);

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get donation report
 */
const getDonationReport = async (req, res, next) => {
  try {
    const report = await donationService.getDonationReport(req.query);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get donations by member
 */
const getDonationsByMember = async (req, res, next) => {
  try {
    const result = await donationService.getDonationsByMember(req.params.id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete donation (soft delete)
 */
const deleteDonation = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await donationService.deleteDonation(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create donation link
 */
const createDonationLink = async (req, res, next) => {
  try {
    const link = await donationService.createDonationLink(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Donation link created successfully',
      data: link
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get donation link by slug (public)
 */
const getDonationLinkBySlug = async (req, res, next) => {
  try {
    const link = await donationService.getDonationLinkBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: link
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event + items for donation link (public) – item-based donations
 */
const getDonationLinkEventItems = async (req, res, next) => {
  try {
    const result = await donationService.getDonationLinkEventItems(req.params.slug);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Durga donation link (public)
 */
const getDurgaDonationLink = async (req, res, next) => {
  try {
    const link = await donationService.getDurgaDonationLink(req.params.durgaId);

    res.status(200).json({
      success: true,
      data: link
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Durga donation link not found'
    });
  }
};

/**
 * Create Razorpay order
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, receiptNumber, notes } = req.body;
    const order = await donationService.createRazorpayOrder(amount, receiptNumber, notes);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: require('../services/razorpayService').getKeyId()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment
 */
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { donationData, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    const donation = await donationService.verifyRazorpayPayment(
      donationData,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    // Audit log only when we have a user (e.g. admin-initiated Razorpay)
    if (donation.createdBy) {
      await require('../utils/auditLogger').createAuditLog({
        userId: donation.createdBy,
        action: 'CREATE',
        module: 'DONATION',
        newData: donation.toObject(),
        ipAddress
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and donation recorded successfully',
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment transactions (admin)
 */
const getPaymentTransactions = async (req, res, next) => {
  try {
    const PaymentTransaction = require('../models/PaymentTransaction');
    const { page = 1, limit = 20, status, processed } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    
    if (status) filter.status = status;
    if (processed !== undefined) filter.processed = processed === 'true';
    
    const [transactions, total] = await Promise.all([
      PaymentTransaction.find(filter)
        .populate('donationId', 'donorName amount receiptNumber status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PaymentTransaction.countDocuments(filter)
    ]);
    
    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: skip + transactions.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment transaction by ID (admin)
 */
const getPaymentTransactionById = async (req, res, next) => {
  try {
    const PaymentTransaction = require('../models/PaymentTransaction');
    const transaction = await PaymentTransaction.findById(req.params.id)
      .populate('donationId');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download donation slip PDF
 */
const downloadDonationSlip = async (req, res, next) => {
  try {
    const pdfPath = await donationService.generateDonationSlipPDF(req.params.id);
    const path = require('path');
    const { uploadDir } = require('../config/env');
    const fullPath = path.resolve(uploadDir, path.basename(pdfPath));

    res.download(fullPath, `donation-receipt-${req.params.id}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading donation slip'
          });
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  getDonationReport,
  getDonationsByMember,
  deleteDonation,
  createDonationLink,
  getDonationLinkBySlug,
  getDonationLinkEventItems,
  getDurgaDonationLink,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook: webhookController.handleRazorpayWebhook,
  getPaymentTransactions,
  getPaymentTransactionById,
  downloadDonationSlip
};


