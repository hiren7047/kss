const Joi = require('joi');

const createEventItemSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required(),
  name: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null).optional(),
  unitPrice: Joi.number().min(0.01).required(),
  totalQuantity: Joi.number().integer().min(1).required(),
  totalAmount: Joi.number().min(0.01).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional()
});

const updateEventItemSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().allow('', null).optional(),
  unitPrice: Joi.number().min(0.01).optional(),
  totalQuantity: Joi.number().integer().min(1).optional(),
  totalAmount: Joi.number().min(0.01).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional()
});

module.exports = {
  createEventItemSchema,
  updateEventItemSchema
};
