const Joi = require('joi');

const uploadDocumentSchema = Joi.object({
  title: Joi.string().trim().required(),
  category: Joi.string().valid('audit', 'utilization', 'event', 'legal', 'other').required(),
  visibility: Joi.string().valid('public', 'private').optional()
});

const documentQuerySchema = Joi.object({
  category: Joi.string().valid('audit', 'utilization', 'event', 'legal', 'other').optional(),
  visibility: Joi.string().valid('public', 'private').optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

module.exports = {
  uploadDocumentSchema,
  documentQuerySchema
};


