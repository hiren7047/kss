const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  password: Joi.string().min(6).required()
}).or('email', 'mobile').messages({
  'object.missing': 'Either email or mobile is required'
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'ACCOUNTANT', 'EVENT_MANAGER', 'VOLUNTEER_MANAGER', 'CONTENT_MANAGER', 'AUDITOR').default('ADMIN')
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
  registerSchema
};


