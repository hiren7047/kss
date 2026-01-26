const Razorpay = require('razorpay');
const crypto = require('crypto');
const { razorpayKeyId, razorpayKeySecret } = require('../config/env');

// Initialize Razorpay instance
let razorpayInstance = null;

if (razorpayKeyId && razorpayKeySecret) {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
  });
} else {
  console.warn('Razorpay credentials not configured. Payment gateway will not work.');
}

/**
 * Create Razorpay order
 * @param {Number} amount - Amount in rupees
 * @param {String} receipt - Receipt identifier
 * @param {Object} notes - Additional notes
 * @returns {Promise<Object>} Order object
 */
const createOrder = async (amount, receipt, notes = {}) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }

  if (!amount || amount <= 0) {
    throw new Error('Invalid amount. Amount must be greater than 0.');
  }

  try {
    // Convert amount to paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise < 100) {
      throw new Error('Amount must be at least ₹1 (100 paise).');
    }

    // Razorpay receipt max 40 chars
    const receiptStr = (receipt || `rec_${Date.now()}`).toString().slice(0, 40);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptStr,
      notes: notes || {}
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', {
      error,
      message: error?.message,
      description: error?.error?.description,
      reason: error?.error?.reason,
      code: error?.error?.code,
      amount,
      receipt
    });
    
    // Extract error message from various possible error structures
    let errorMessage = 'Unknown error';
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error?.description) {
      errorMessage = error.error.description;
    } else if (error?.error?.reason) {
      errorMessage = error.error.reason;
    } else if (error?.error?.code) {
      errorMessage = `Razorpay error code: ${error.error.code}`;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error) {
      errorMessage = String(error);
    }
    
    throw new Error(`Failed to create Razorpay order: ${errorMessage}`);
  }
};

/**
 * Verify Razorpay payment signature
 * @param {String} razorpayOrderId - Order ID
 * @param {String} razorpayPaymentId - Payment ID
 * @param {String} razorpaySignature - Payment signature
 * @returns {Boolean} - True if signature is valid
 */
const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (!razorpayKeySecret) {
    throw new Error('Razorpay key secret is not configured');
  }

  try {
    // Create signature string
    const signatureString = `${razorpayOrderId}|${razorpayPaymentId}`;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(signatureString)
      .digest('hex');

    // Compare signatures
    const isValid = expectedSignature === razorpaySignature;
    return isValid;
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {String} paymentId - Payment ID
 * @returns {Promise<Object>} Payment details
 */
const fetchPayment = async (paymentId) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured');
  }

  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Razorpay fetch payment error:', error);
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }
};

/**
 * Fetch order details from Razorpay
 * @param {String} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
const fetchOrder = async (orderId) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured');
  }

  try {
    const order = await razorpayInstance.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error('Razorpay fetch order error:', error);
    throw new Error(`Failed to fetch order: ${error.message}`);
  }
};

/**
 * Verify Razorpay webhook signature
 * @param {String} webhookBody - Raw webhook body
 * @param {String} webhookSignature - Webhook signature from headers
 * @returns {Boolean} - True if signature is valid
 */
const verifyWebhookSignature = (webhookBody, webhookSignature) => {
  const { razorpayWebhookSecret } = require('../config/env');
  
  if (!razorpayWebhookSecret) {
    console.warn('Razorpay webhook secret not configured');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
};

/**
 * Get Razorpay key ID for frontend
 * @returns {String} Key ID
 */
const getKeyId = () => {
  return razorpayKeyId || '';
};

module.exports = {
  createOrder,
  verifyPayment,
  fetchPayment,
  fetchOrder,
  verifyWebhookSignature,
  getKeyId
};
