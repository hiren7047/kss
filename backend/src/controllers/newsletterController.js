const newsletterService = require('../services/newsletterService');
const EmailLog = require('../models/EmailLog');

// Public subscribe
const subscribe = async (req, res, next) => {
  try {
    const subscriber = await newsletterService.subscribe({
      email: req.body.email,
      name: req.body.name,
      language: req.body.language,
      source: 'mainsite',
    });

    res.status(201).json({
      success: true,
      message: 'Subscribed to newsletter successfully',
      data: subscriber,
    });
  } catch (error) {
    next(error);
  }
};

// Public unsubscribe by token
const unsubscribe = async (req, res, next) => {
  try {
    const subscriber = await newsletterService.unsubscribeByToken(req.params.token);
    res.status(200).json({
      success: true,
      message: 'You have been unsubscribed from the newsletter',
      data: {
        email: subscriber.email,
        isSubscribed: subscriber.isSubscribed,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid unsubscribe link',
    });
  }
};

// Admin: list subscribers
const getSubscribers = async (req, res, next) => {
  try {
    const result = await newsletterService.listSubscribers(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: send newsletter
const sendNewsletter = async (req, res, next) => {
  try {
    const result = await newsletterService.sendNewsletter({
      templateId: req.body.templateId,
      language: req.body.language,
      onlySubscribed: req.body.onlySubscribed,
      testEmail: req.body.testEmail,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      message:
        result.mode === 'test'
          ? 'Test email sent successfully'
          : `Newsletter queued for ${result.recipients} subscribers`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: simple email logs listing
const getEmailLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.templateCode) {
      filter.templateCode = req.query.templateCode;
    }
    if (req.query.email) {
      filter.to = { $regex: req.query.email.trim(), $options: 'i' };
    }

    const [logs, total] = await Promise.all([
      EmailLog.find(filter).sort({ sentAt: -1 }).skip(skip).limit(limit),
      EmailLog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendNewsletter,
  getEmailLogs,
};

