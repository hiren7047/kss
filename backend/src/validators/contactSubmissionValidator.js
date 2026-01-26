const Joi = require('joi');

const createContactSubmissionSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().allow('', null).optional(),
  subject: Joi.string().trim().allow('', null).optional(),
  message: Joi.string().trim().required()
});

const updateContactSubmissionSchema = Joi.object({
  status: Joi.string().valid('new', 'read', 'replied', 'archived').optional()
});

const replyContactSubmissionSchema = Joi.object({
  replyMessage: Joi.string().trim().required()
});

module.exports = {
  createContactSubmissionSchema,
  updateContactSubmissionSchema,
  replyContactSubmissionSchema
};
