const donationService = require('../services/donationService');
const razorpayService = require('../services/razorpayService');

/**
 * Handle Razorpay webhook
 */
const handleRazorpayWebhook = async (req, res, next) => {
  try {
    // Get webhook signature from headers
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: 'Webhook signature missing'
      });
    }

    // Get raw body (Buffer from raw middleware)
    const rawBody = req.body.toString('utf8');
    
    // Parse JSON body
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON in webhook body'
      });
    }

    // Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(rawBody, webhookSignature);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Extract event type and payload
    const event = body.event;
    const payload = body;

    // Process webhook
    const result = await donationService.handleRazorpayWebhook(event, payload);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    next(error);
  }
};

module.exports = {
  handleRazorpayWebhook
};
