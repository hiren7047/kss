const Joi = require('joi');

const createDonationSchema = Joi.object({
  donorName: Joi.string().trim().required(),
  memberId: Joi.string().hex().length(24).allow('', null).optional(),
  amount: Joi.number().positive().required(),
  purpose: Joi.string().valid('event', 'general', 'emergency').required(),
  paymentMode: Joi.string().valid('upi', 'cash', 'bank', 'razorpay').required(),
  transactionId: Joi.string().trim().allow('', null).optional(),
  eventId: Joi.string().hex().length(24).allow('', null).optional(),
  isAnonymous: Joi.boolean().optional(),
  donationLinkSlug: Joi.string().trim().optional()
});

const donationReportSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  purpose: Joi.string().valid('event', 'general', 'emergency').optional(),
  paymentMode: Joi.string().valid('upi', 'cash', 'bank', 'razorpay').optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

const createDonationLinkSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  purpose: Joi.string().valid('event', 'general', 'emergency').required(),
  eventId: Joi.string().hex().length(24).allow('', null).optional(),
  durgaId: Joi.string().valid('saraswati', 'annapurna', 'ganga', 'kali', 'lakshmi').allow('', null).optional(),
  suggestedAmount: Joi.number().positive().allow(null).optional(),
  expiresAt: Joi.date().allow(null).optional()
});

const createRazorpayOrderSchema = Joi.object({
  amount: Joi.number().positive().required(),
  receiptNumber: Joi.string().trim().required(),
  notes: Joi.object().optional()
});

const verifyRazorpayPaymentSchema = Joi.object({
  donationData: Joi.object({
    donorName: Joi.string().trim().required(),
    memberId: Joi.string().hex().length(24).allow('', null).optional(),
    amount: Joi.number().positive().required(),
    purpose: Joi.string().valid('event', 'general', 'emergency').required(),
    eventId: Joi.string().hex().length(24).allow('', null).optional(),
    eventItemId: Joi.string().hex().length(24).allow('', null).optional(),
    itemQuantity: Joi.number().integer().min(0).optional(),
    donationType: Joi.string().valid('general', 'item_specific', 'expense_specific').optional(),
    isAnonymous: Joi.boolean().optional(),
    donationLinkSlug: Joi.string().trim().optional()
  }).required(),
  razorpayOrderId: Joi.string().trim().required(),
  razorpayPaymentId: Joi.string().trim().required(),
  razorpaySignature: Joi.string().trim().required()
});

module.exports = {
  createDonationSchema,
  donationReportSchema,
  createDonationLinkSchema,
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema
};


