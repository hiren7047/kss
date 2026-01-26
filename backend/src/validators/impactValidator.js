const Joi = require('joi');

const updateImpactNumberSchema = Joi.object({
  label: Joi.string().trim().required(),
  value: Joi.number().min(0).required(),
  suffix: Joi.string().trim().allow('', null).optional(),
  icon: Joi.string().trim().allow('', null).optional(),
  language: Joi.string().valid('en', 'gu', 'hi').required(),
  isActive: Joi.boolean().optional(),
  displayOrder: Joi.number().integer().min(0).optional()
});

const bulkUpdateImpactSchema = Joi.object({
  impactNumbers: Joi.array().items(
    Joi.object({
      id: Joi.string().hex().length(24).optional(),
      label: Joi.string().trim().required(),
      value: Joi.number().min(0).required(),
      suffix: Joi.string().trim().allow('', null).optional(),
      icon: Joi.string().trim().allow('', null).optional(),
      language: Joi.string().valid('en', 'gu', 'hi').required(),
      isActive: Joi.boolean().optional(),
      displayOrder: Joi.number().integer().min(0).optional()
    })
  ).min(1).required()
});

module.exports = {
  updateImpactNumberSchema,
  bulkUpdateImpactSchema
};
