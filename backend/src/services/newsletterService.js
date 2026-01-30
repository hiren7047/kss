const crypto = require('crypto');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const EmailTemplate = require('../models/EmailTemplate');
const { sendTemplatedEmail } = require('./emailService');

function generateUnsubscribeToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function subscribe({ email, name, language = 'en', source = 'mainsite' }) {
  const normalizedEmail = email.toLowerCase().trim();

  let subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

  if (subscriber) {
    // Reactivate if previously unsubscribed
    subscriber.isSubscribed = true;
    subscriber.unsubscribedAt = null;
    if (name) subscriber.name = name;
    if (language) subscriber.language = language;
  } else {
    subscriber = new NewsletterSubscriber({
      email: normalizedEmail,
      name,
      language,
      source,
      unsubscribeToken: generateUnsubscribeToken(),
    });
  }

  await subscriber.save();
  return subscriber;
}

async function unsubscribeByToken(token) {
  const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });
  if (!subscriber) {
    throw new Error('Subscriber not found');
  }

  subscriber.isSubscribed = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  return subscriber;
}

async function unsubscribeByEmail(email) {
  const subscriber = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
  if (!subscriber) {
    throw new Error('Subscriber not found');
  }

  subscriber.isSubscribed = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  return subscriber;
}

async function listSubscribers(query = {}) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.isSubscribed !== undefined) {
    filter.isSubscribed = query.isSubscribed === 'true' || query.isSubscribed === true;
  }

  if (query.language) {
    filter.language = query.language;
  }

  if (query.search) {
    const search = query.search.trim().toLowerCase();
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const [subscribers, total] = await Promise.all([
    NewsletterSubscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    NewsletterSubscriber.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: subscribers,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

async function sendNewsletter({ templateId, language, onlySubscribed = true, testEmail, user }) {
  const template = await EmailTemplate.findOne({
    _id: templateId,
    type: 'newsletter',
    status: 'active',
    softDelete: false,
  });

  if (!template) {
    throw new Error('Newsletter template not found or inactive');
  }

  // Test email path
  if (testEmail) {
    await sendTemplatedEmail({
      templateCode: template.code,
      to: testEmail,
      variables: {
        name: 'Test Recipient',
        unsubscribeUrl: '#',
      },
      meta: {
        mode: 'test',
      },
      user,
    });

    return {
      mode: 'test',
      recipients: 1,
    };
  }

  // Actual bulk send
  const subsQuery = {};
  if (onlySubscribed) {
    subsQuery.isSubscribed = true;
  }
  if (language) {
    subsQuery.language = language;
  }

  const subscribers = await NewsletterSubscriber.find(subsQuery).lean();

  if (!subscribers.length) {
    return {
      mode: 'bulk',
      recipients: 0,
    };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const sub of subscribers) {
    try {
      const unsubscribeUrl = `${frontendBaseUrl.replace(/\/$/, '')}/newsletter/unsubscribe?token=${
        sub.unsubscribeToken
      }`;

      await sendTemplatedEmail({
        templateCode: template.code,
        to: sub.email,
        variables: {
          name: sub.name || sub.email,
          unsubscribeUrl,
          language: sub.language,
        },
        meta: {
          mode: 'bulk',
          subscriberId: sub._id,
        },
        user,
      });

      successCount += 1;
    } catch (error) {
      failureCount += 1;
    }
  }

  return {
    mode: 'bulk',
    recipients: subscribers.length,
    successCount,
    failureCount,
  };
}

module.exports = {
  subscribe,
  unsubscribeByToken,
  unsubscribeByEmail,
  listSubscribers,
  sendNewsletter,
};

