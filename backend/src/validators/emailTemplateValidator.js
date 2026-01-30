const Joi = require('joi');

const createEmailTemplateSchema = Joi.object({
  name: Joi.string().trim().required(),
  code: Joi.string().trim().uppercase().alphanum().min(3).max(64).required(),
  type: Joi.string().valid('transactional', 'newsletter').default('newsletter'),
  subject: Joi.string().trim().required(),
  bodyHtml: Joi.string().trim().required(),
  bodyText: Joi.string().trim().allow('', null),
  variables: Joi.array().items(Joi.string().trim()).default([]),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

const updateEmailTemplateSchema = Joi.object({
  name: Joi.string().trim(),
  subject: Joi.string().trim(),
  bodyHtml: Joi.string().trim(),
  bodyText: Joi.string().trim().allow('', null),
  variables: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid('active', 'inactive'),
}).min(1);

module.exports = {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
};

