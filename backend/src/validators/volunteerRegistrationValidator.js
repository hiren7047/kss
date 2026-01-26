const Joi = require('joi');

const createVolunteerRegistrationSchema = Joi.object({
  name: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  email: Joi.string().email().allow('', null).optional(),
  city: Joi.string().trim().required(),
  age: Joi.number().integer().min(1).max(150).required(),
  occupation: Joi.string().trim().allow('', null).optional(),
  interests: Joi.array().items(Joi.string().trim()).optional(),
  aboutYou: Joi.string().trim().allow('', null).optional()
});

const updateVolunteerRegistrationSchema = Joi.object({
  status: Joi.string().valid('pending', 'contacted', 'approved', 'rejected').optional(),
  assignedTo: Joi.string().hex().length(24).allow('', null).optional(),
  notes: Joi.string().trim().allow('', null).optional()
});

module.exports = {
  createVolunteerRegistrationSchema,
  updateVolunteerRegistrationSchema
};
