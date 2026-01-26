const Joi = require('joi');

const createTestimonialSchema = Joi.object({
  quote: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  role: Joi.string().trim().required(),
  language: Joi.string().valid('en', 'gu', 'hi').required(),
  photo: Joi.string().uri().allow('', null).optional(),
  displayOrder: Joi.number().integer().min(0).optional()
});

const updateTestimonialSchema = Joi.object({
  quote: Joi.string().trim().optional(),
  name: Joi.string().trim().optional(),
  role: Joi.string().trim().optional(),
  language: Joi.string().valid('en', 'gu', 'hi').optional(),
  photo: Joi.string().uri().allow('', null).optional(),
  displayOrder: Joi.number().integer().min(0).optional()
});

const approveTestimonialSchema = Joi.object({
  isActive: Joi.boolean().required()
});

module.exports = {
  createTestimonialSchema,
  updateTestimonialSchema,
  approveTestimonialSchema
};
