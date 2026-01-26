const Joi = require('joi');

// Field validation schema
const formFieldSchema = Joi.object({
  fieldId: Joi.string().required(),
  label: Joi.string().trim().required(),
  type: Joi.string().valid('text', 'email', 'phone', 'number', 'date', 'textarea', 'select', 'checkbox', 'radio', 'file').required(),
  placeholder: Joi.string().trim().allow('', null).optional(),
  required: Joi.boolean().default(false),
  options: Joi.array().items(
    Joi.object({
      label: Joi.string().required(),
      value: Joi.string().required()
    })
  ).when('type', {
    is: Joi.string().valid('select', 'radio', 'checkbox'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  validation: Joi.object({
    minLength: Joi.number().min(0).optional(),
    maxLength: Joi.number().min(0).optional(),
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    pattern: Joi.string().optional(),
    customMessage: Joi.string().optional()
  }).optional(),
  order: Joi.number().default(0)
});

// Create form schema
const createFormSchema = Joi.object({
  title: Joi.string().trim().required().min(1).max(200),
  description: Joi.string().trim().allow('', null).optional(),
  eventId: Joi.string().hex().length(24).allow(null).optional(),
  fields: Joi.array().items(formFieldSchema).min(1).required(),
  slug: Joi.string().trim().lowercase().allow('', null).optional()
    .pattern(/^[a-z0-9-]+$/)
    .messages({
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),
  status: Joi.string().valid('draft', 'active', 'inactive', 'closed').default('draft'),
  allowMultipleSubmissions: Joi.boolean().default(false),
  maxSubmissions: Joi.number().min(1).allow(null).optional(),
  startDate: Joi.date().allow(null).optional(),
  endDate: Joi.date().greater(Joi.ref('startDate')).allow(null).optional().messages({
    'date.greater': 'End date must be after start date'
  }),
  successMessage: Joi.string().trim().allow('', null).optional(),
  redirectUrl: Joi.string().uri().allow('', null).optional()
});

// Update form schema
const updateFormSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  eventId: Joi.string().hex().length(24).allow(null).optional(),
  fields: Joi.array().items(formFieldSchema).min(1).optional(),
  slug: Joi.string().trim().lowercase().allow('', null).optional()
    .pattern(/^[a-z0-9-]+$/)
    .messages({
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),
  status: Joi.string().valid('draft', 'active', 'inactive', 'closed').optional(),
  allowMultipleSubmissions: Joi.boolean().optional(),
  maxSubmissions: Joi.number().min(1).allow(null).optional(),
  startDate: Joi.date().allow(null).optional(),
  endDate: Joi.date().allow(null).optional(),
  successMessage: Joi.string().trim().allow('', null).optional(),
  redirectUrl: Joi.string().uri().allow('', null).optional()
}).custom((value, helpers) => {
  // If endDate is provided, ensure it's after startDate
  if (value.endDate && value.startDate && value.endDate <= value.startDate) {
    return helpers.error('date.greater');
  }
  return value;
}, 'End date validation');

// Submit form schema (dynamic based on form fields, but basic structure)
const submitFormSchema = Joi.object({
  responses: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.array().items(Joi.string()),
      Joi.array().items(Joi.number())
    )
  ).required(),
  // File uploads will be handled separately via multipart/form-data
}).unknown(false);

// Update submission status schema
const updateSubmissionSchema = Joi.object({
  status: Joi.string().valid('submitted', 'reviewed', 'archived').optional(),
  adminNotes: Joi.string().trim().allow('', null).optional()
});

module.exports = {
  createFormSchema,
  updateFormSchema,
  submitFormSchema,
  updateSubmissionSchema
};
