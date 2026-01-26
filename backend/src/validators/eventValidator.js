const Joi = require('joi');

const createEventSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null).optional(),
  location: Joi.string().trim().allow('', null).optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'date.greater': 'End date must be after start date'
  }),
  budget: Joi.number().min(0).optional(),
  targetAmount: Joi.number().min(0).optional(),
  managerId: Joi.string().hex().length(24).required(),
  status: Joi.string().valid('planned', 'ongoing', 'completed', 'cancelled').optional()
});

const updateEventSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().allow('', null).optional(),
  location: Joi.string().trim().allow('', null).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  budget: Joi.number().min(0).optional(),
  targetAmount: Joi.number().min(0).optional(),
  managerId: Joi.string().hex().length(24).optional(),
  status: Joi.string().valid('planned', 'ongoing', 'completed', 'cancelled').optional()
});

module.exports = {
  createEventSchema,
  updateEventSchema
};


