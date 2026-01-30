const Donation = require('../models/Donation');
const DonationLink = require('../models/DonationLink');
const PaymentTransaction = require('../models/PaymentTransaction');
const Event = require('../models/Event');
const EventItem = require('../models/EventItem');
const { generateReceiptNumber } = require('../utils/receiptGenerator');
const { createAuditLog } = require('../utils/auditLogger');
const { updateWalletAfterDonation, recalculateWallet } = require('../utils/walletUpdater');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const { createDateRangeFilter } = require('../utils/dateFilters');
const { generateDonationSlip } = require('../utils/pdfGenerator');
const razorpayService = require('./razorpayService');
const eventItemService = require('./eventItemService');
const { notifyDonationReceived } = require('../utils/notificationHelper');
const moment = require('moment');

/**
 * Create a new donation
 */
const createDonation = async (donationData, userId, ipAddress) => {
  // Generate receipt number
  const receiptNumber = await generateReceiptNumber(Donation);

  // Set donation type if eventItemId is provided
  if (donationData.eventItemId && !donationData.donationType) {
    donationData.donationType = 'item_specific';
  }

  const donation = await Donation.create({
    ...donationData,
    receiptNumber,
    createdBy: userId
  });

  // Update wallet
  await updateWalletAfterDonation(donationData.amount);

  // If donation is for a specific item, update the item's donation stats
  if (donation.eventItemId && donation.status === 'completed') {
    try {
      await eventItemService.updateItemDonation(
        donation.eventItemId,
        donation.amount,
        donation.itemQuantity || 0
      );
    } catch (error) {
      console.error('Error updating event item donation:', error);
      // Don't fail the donation creation if item update fails
    }
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'DONATION',
    newData: donation.toObject(),
    ipAddress
  });

  // Create notification for admins
  try {
    await notifyDonationReceived(donation);
  } catch (error) {
    console.error('Error creating donation notification:', error);
    // Don't fail donation creation if notification fails
  }

  return donation;
};

/**
 * Get all donations with pagination and filters
 */
const getDonations = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  // Apply filters
  if (query.purpose) {
    filter.purpose = query.purpose;
  }
  if (query.paymentMode) {
    filter.paymentMode = query.paymentMode;
  }
  if (query.memberId) {
    filter.memberId = query.memberId;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }

  // Search filter (donor name, receipt number, transaction ID)
  if (query.search) {
    const searchRegex = { $regex: query.search, $options: 'i' };
    filter.$or = [
      { donorName: searchRegex },
      { receiptNumber: searchRegex },
      { transactionId: searchRegex },
      { razorpayPaymentId: searchRegex },
      { razorpayOrderId: searchRegex }
    ];
  }

  // Date range filter
  const dateFilter = createDateRangeFilter(query.startDate, query.endDate);
  Object.assign(filter, dateFilter);

  const [donations, total] = await Promise.all([
    Donation.find(filter)
      .populate('memberId', 'name memberId email')
      .populate('eventId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Donation.countDocuments(filter)
  ]);

  return createPaginationResponse(donations, total, page, limit);
};

/**
 * Get donation by ID
 */
const getDonationById = async (id) => {
  const donation = await Donation.findOne({ _id: id, softDelete: false })
    .populate('memberId', 'name memberId')
    .populate('eventId', 'name')
    .populate('createdBy', 'name email');
  
  if (!donation) {
    throw new Error('Donation not found');
  }
  return donation;
};

/**
 * Get donation report with enhanced stats
 */
const getDonationReport = async (query) => {
  const filter = { softDelete: false };

  // Apply filters
  if (query.purpose) {
    filter.purpose = query.purpose;
  }
  if (query.paymentMode) {
    filter.paymentMode = query.paymentMode;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }

  // Date range filter
  const dateFilter = createDateRangeFilter(query.startDate, query.endDate);
  Object.assign(filter, dateFilter);

  const donations = await Donation.find(filter)
    .populate('memberId', 'name memberId')
    .populate('eventId', 'name')
    .sort({ createdAt: -1 });

  // Calculate totals
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalCount = donations.length;

  // This month stats
  const now = new Date();
  const startOfMonth = moment(now).startOf('month').toDate();
  const endOfMonth = moment(now).endOf('month').toDate();
  const startOfLastMonth = moment(now).subtract(1, 'month').startOf('month').toDate();
  const endOfLastMonth = moment(now).subtract(1, 'month').endOf('month').toDate();

  const thisMonthDonations = donations.filter(d => {
    const createdAt = new Date(d.createdAt);
    return createdAt >= startOfMonth && createdAt <= endOfMonth;
  });
  const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);

  const lastMonthDonations = donations.filter(d => {
    const createdAt = new Date(d.createdAt);
    return createdAt >= startOfLastMonth && createdAt <= endOfLastMonth;
  });
  const lastMonthAmount = lastMonthDonations.reduce((sum, d) => sum + d.amount, 0);

  const monthGrowth = lastMonthAmount > 0 
    ? Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100)
    : 0;

  // Average donation
  const averageDonation = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  // Unique donors (this year)
  const startOfYear = moment(now).startOf('year').toDate();
  const thisYearDonations = donations.filter(d => {
    const createdAt = new Date(d.createdAt);
    return createdAt >= startOfYear;
  });
  const uniqueDonors = new Set(
    thisYearDonations
      .filter(d => d.memberId && !d.isAnonymous)
      .map(d => d.memberId._id ? d.memberId._id.toString() : d.memberId.toString())
  ).size;

  // Group by purpose
  const byPurpose = donations.reduce((acc, d) => {
    acc[d.purpose] = (acc[d.purpose] || 0) + d.amount;
    return acc;
  }, {});

  // Group by payment mode
  const byPaymentMode = donations.reduce((acc, d) => {
    acc[d.paymentMode] = (acc[d.paymentMode] || 0) + d.amount;
    return acc;
  }, {});

  return {
    summary: {
      totalAmount,
      totalCount,
      thisMonthAmount,
      monthGrowth,
      averageDonation,
      uniqueDonors
    },
    byPurpose,
    byPaymentMode,
    donations
  };
};

/**
 * Get donations by member ID
 */
const getDonationsByMember = async (memberId) => {
  const donations = await Donation.find({
    memberId,
    softDelete: false
  })
    .populate('eventId', 'name')
    .sort({ createdAt: -1 });

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  return {
    donations,
    totalAmount,
    totalCount: donations.length
  };
};

/**
 * Soft delete donation
 */
const deleteDonation = async (id, userId, ipAddress) => {
  const donation = await Donation.findOne({ _id: id, softDelete: false });
  if (!donation) {
    throw new Error('Donation not found');
  }

  const oldData = donation.toObject();
  donation.softDelete = true;
  await donation.save();

  // Recalculate wallet
  await recalculateWallet();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'DONATION',
    oldData,
    newData: donation.toObject(),
    ipAddress
  });

  return donation;
};

/**
 * Create donation link
 */
const createDonationLink = async (linkData, userId) => {
  const donationLink = await DonationLink.create({
    ...linkData,
    createdBy: userId
  });

  return donationLink;
};

/**
 * Get donation link by slug (public)
 */
const getDonationLinkBySlug = async (slug) => {
  const link = await DonationLink.findOne({
    slug,
    isActive: true,
    softDelete: false
  })
    .populate('eventId', 'name')
    .populate('createdBy', 'name email');

  if (!link) {
    throw new Error('Donation link not found or expired');
  }

  // Check if link has expired
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    throw new Error('Donation link has expired');
  }

  return link;
};

/**
 * Get event + items for donation link (public) – for item-based donations
 * Only returns data when link has eventId; used by donate page to show items.
 */
const getDonationLinkEventItems = async (slug) => {
  const link = await DonationLink.findOne({
    slug,
    isActive: true,
    softDelete: false
  }).select('eventId');

  if (!link) {
    throw new Error('Donation link not found or expired');
  }
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    throw new Error('Donation link has expired');
  }
  if (!link.eventId) {
    return { event: null, items: [] };
  }

  const [event, itemResult] = await Promise.all([
    Event.findOne({ _id: link.eventId, softDelete: false }).select('name _id'),
    eventItemService.getEventItems(link.eventId, { limit: 100 })
  ]);

  const items = itemResult.data || itemResult;
  return {
    event: event ? { _id: event._id, name: event.name } : null,
    items: Array.isArray(items) ? items : []
  };
};

/**
 * Get Durga donation link (public)
 */
const getDurgaDonationLink = async (durgaId) => {
  const link = await DonationLink.findOne({
    durgaId,
    isActive: true,
    softDelete: false
  })
    .populate('eventId', 'name')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 }); // Get the most recent one

  if (!link) {
    throw new Error('Durga donation link not found');
  }

  // Check if link has expired
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    throw new Error('Durga donation link has expired');
  }

  return link;
};

/**
 * Create Razorpay order for donation
 */
const createRazorpayOrder = async (amount, receiptNumber, notes = {}) => {
  const order = await razorpayService.createOrder(amount, receiptNumber, notes);
  return order;
};

/**
 * Verify and complete Razorpay payment
 */
const verifyRazorpayPayment = async (donationData, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  // Check if payment already processed
  const existingTransaction = await PaymentTransaction.findOne({ razorpayPaymentId });
  if (existingTransaction && existingTransaction.processed && existingTransaction.donationId) {
    // Return existing donation
    const donation = await Donation.findById(existingTransaction.donationId);
    if (donation) {
      return donation;
    }
  }

  // Verify signature
  const isValid = razorpayService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  
  if (!isValid) {
    throw new Error('Invalid payment signature');
  }

  // Fetch payment details from Razorpay
  const payment = await razorpayService.fetchPayment(razorpayPaymentId);
  
  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    throw new Error(`Payment not successful. Status: ${payment.status}`);
  }

  // Create or update payment transaction record
  let paymentTransaction = existingTransaction;
  if (!paymentTransaction) {
    paymentTransaction = await PaymentTransaction.create({
      razorpayPaymentId,
      razorpayOrderId,
      amount: payment.amount / 100, // Convert from paise
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.method,
      rawData: payment
    });
  } else {
    paymentTransaction.status = payment.status;
    paymentTransaction.rawData = payment;
    await paymentTransaction.save();
  }

  // Generate receipt number
  const receiptNumber = await generateReceiptNumber(Donation);

  // Create donation
  const donation = await Donation.create({
    ...donationData,
    receiptNumber,
    paymentMode: 'razorpay',
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: payment.status === 'captured' ? 'completed' : 'pending',
    transactionId: razorpayPaymentId
  });

  // Link donation to transaction
  paymentTransaction.donationId = donation._id;
  paymentTransaction.processed = true;
  paymentTransaction.processedAt = new Date();
  await paymentTransaction.save();

  // Update wallet if payment is completed
  if (donation.status === 'completed') {
    await updateWalletAfterDonation(donationData.amount);
    
    // If donation is for a specific item, update the item's donation stats
    if (donation.eventItemId) {
      try {
        await eventItemService.updateItemDonation(
          donation.eventItemId,
          donation.amount,
          donation.itemQuantity || 0
        );
      } catch (error) {
        console.error('Error updating event item donation:', error);
      }
    }
  }

  // Update donation link stats if applicable
  if (donationData.donationLinkSlug) {
    await DonationLink.findOneAndUpdate(
      { slug: donationData.donationLinkSlug },
      {
        $inc: { donationCount: 1, totalAmount: donationData.amount }
      }
    );
  }

  // Create notification for admins if donation is completed
  if (donation.status === 'completed') {
    try {
      await notifyDonationReceived(donation);
    } catch (error) {
      console.error('Error creating donation notification:', error);
      // Don't fail donation creation if notification fails
    }
  }

  return donation;
};

/**
 * Handle Razorpay webhook event
 */
const handleRazorpayWebhook = async (event, payload) => {
  try {
    // Razorpay webhook structure: { event: 'payment.captured', payload: { payment: { entity: {...} } } }
    const paymentEntity = payload.payload?.payment?.entity;
    
    if (paymentEntity) {
      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;
      const status = paymentEntity.status;
      const amount = paymentEntity.amount / 100; // Convert from paise

      if (!paymentId) {
        console.error('Webhook: Payment ID missing');
        return { success: false, message: 'Payment ID missing' };
      }

      // Find or create payment transaction
      let paymentTransaction = await PaymentTransaction.findOne({ razorpayPaymentId: paymentId });
      
      if (!paymentTransaction) {
        paymentTransaction = await PaymentTransaction.create({
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          amount: amount,
          currency: paymentEntity.currency || 'INR',
          status: status,
          paymentMethod: paymentEntity.method,
          rawData: paymentEntity
        });
      } else {
        // Update status
        paymentTransaction.status = status;
        paymentTransaction.rawData = paymentEntity;
      }

      // Add webhook event
      paymentTransaction.webhookEvents.push({
        event: event,
        payload: payload.payload
      });
      await paymentTransaction.save();

      // If payment is captured and not yet processed, process it
      if (status === 'captured' && !paymentTransaction.processed) {
        // Try to find donation by order ID or payment ID
        let donation = await Donation.findOne({
          $or: [
            { razorpayOrderId: orderId },
            { razorpayPaymentId: paymentId }
          ]
        });

        if (!donation && orderId) {
          try {
            // Extract donation data from order notes
            const order = await razorpayService.fetchOrder(orderId);
            const notes = order.notes || {};
            
            if (notes.donorName || notes.amount) {
              // Create donation from webhook
              const receiptNumber = await generateReceiptNumber(Donation);
              donation = await Donation.create({
                donorName: notes.donorName || 'Anonymous',
                amount: parseFloat(notes.amount) || amount,
                purpose: notes.purpose || 'general',
                paymentMode: 'razorpay',
                razorpayOrderId: orderId,
                razorpayPaymentId: paymentId,
                status: 'completed',
                transactionId: paymentId,
                isAnonymous: notes.isAnonymous === 'true',
                receiptNumber
              });

              // Update wallet
              await updateWalletAfterDonation(donation.amount);

              // Update donation link if applicable
              if (notes.slug) {
                await DonationLink.findOneAndUpdate(
                  { slug: notes.slug },
                  {
                    $inc: { donationCount: 1, totalAmount: donation.amount }
                  }
                );
              }

              // Create notification for admins
              try {
                await notifyDonationReceived(donation);
              } catch (error) {
                console.error('Error creating donation notification from webhook:', error);
                // Don't fail donation creation if notification fails
              }
            }
          } catch (error) {
            console.error('Error creating donation from webhook:', error);
          }
        }

        if (donation) {
          // Update donation status to completed
          if (donation.status !== 'completed') {
            donation.status = 'completed';
            await donation.save();

            // Update wallet if not already updated
            if (paymentTransaction.status === 'captured') {
              await updateWalletAfterDonation(donation.amount);
            }

            // Create notification for admins
            try {
              await notifyDonationReceived(donation);
            } catch (error) {
              console.error('Error creating donation notification from webhook:', error);
              // Don't fail webhook processing if notification fails
            }
          }

          // Link transaction to donation
          paymentTransaction.donationId = donation._id;
          paymentTransaction.processed = true;
          paymentTransaction.processedAt = new Date();
          await paymentTransaction.save();
        }
      }

      return { success: true, message: 'Webhook processed' };
    }

    return { success: true, message: 'Event not handled' };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Generate donation slip PDF
 */
const generateDonationSlipPDF = async (donationId) => {
  const donation = await Donation.findOne({ _id: donationId, softDelete: false })
    .populate('memberId', 'name memberId email')
    .populate('eventId', 'name')
    .populate('createdBy', 'name email');

  if (!donation) {
    throw new Error('Donation not found');
  }

  const pdfPath = await generateDonationSlip(donation);
  return pdfPath;
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
  handleRazorpayWebhook,
  generateDonationSlipPDF
};


