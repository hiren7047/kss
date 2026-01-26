const Joi = require('joi');

const createExpensePlanSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null).optional(),
  category: Joi.string().trim().required(),
  estimatedAmount: Joi.number().min(0.01).required(),
  plannedDate: Joi.date().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  notes: Joi.string().trim().allow('', null).optional()
});

const updateExpensePlanSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().allow('', null).optional(),
  category: Joi.string().trim().optional(),
  estimatedAmount: Joi.number().min(0.01).optional(),
  actualAmount: Joi.number().min(0).optional(),
  plannedDate: Joi.date().optional(),
  status: Joi.string().valid('planned', 'in_progress', 'completed', 'cancelled').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  notes: Joi.string().trim().allow('', null).optional()
});

module.exports = {
  createExpensePlanSchema,
  updateExpensePlanSchema
};
