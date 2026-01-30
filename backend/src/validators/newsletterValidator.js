const Joi = require('joi');

const subscribeNewsletterSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().trim().allow('', null),
  language: Joi.string().valid('en', 'gu', 'hi').default('en'),
});

const listSubscribersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  isSubscribed: Joi.string().valid('true', 'false').optional(),
  language: Joi.string().valid('en', 'gu', 'hi').optional(),
  search: Joi.string().trim().optional(),
});

const sendNewsletterSchema = Joi.object({
  templateId: Joi.string().required(),
  language: Joi.string().valid('en', 'gu', 'hi').optional(),
  onlySubscribed: Joi.boolean().default(true),
  testEmail: Joi.string().email().optional(),
});

module.exports = {
  subscribeNewsletterSchema,
  listSubscribersSchema,
  sendNewsletterSchema,
};

