const Joi = require('joi');

const createDurgaContentSchema = Joi.object({
  durgaId: Joi.string().valid('saraswati', 'annapurna', 'ganga', 'kali', 'lakshmi').required(),
  language: Joi.string().valid('en', 'gu', 'hi').optional(),
  name: Joi.string().trim().required(),
  nameGujarati: Joi.string().trim().allow('', null).optional(),
  meaning: Joi.string().trim().allow('', null).optional(),
  meaningGujarati: Joi.string().trim().allow('', null).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  descriptionLong: Joi.string().trim().allow('', null).optional(),
  imageUrl: Joi.string().uri().allow('', null).optional(),
  color: Joi.string().trim().allow('', null).optional(),
  activities: Joi.array().items(Joi.string().trim()).optional(),
  activitiesDetailed: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().required(),
      description: Joi.string().trim().allow('', null).optional()
    })
  ).optional(),
  impactNumbers: Joi.array().items(
    Joi.object({
      label: Joi.string().trim().required(),
      value: Joi.number().min(0).required(),
      suffix: Joi.string().trim().allow('', null).optional()
    })
  ).optional(),
  isActive: Joi.boolean().optional(),
  order: Joi.number().integer().min(0).optional()
});

const updateDurgaContentSchema = Joi.object({
  name: Joi.string().trim().optional(),
  nameGujarati: Joi.string().trim().allow('', null).optional(),
  meaning: Joi.string().trim().allow('', null).optional(),
  meaningGujarati: Joi.string().trim().allow('', null).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  descriptionLong: Joi.string().trim().allow('', null).optional(),
  imageUrl: Joi.string().uri().allow('', null).optional(),
  color: Joi.string().trim().allow('', null).optional(),
  activities: Joi.array().items(Joi.string().trim()).optional(),
  activitiesDetailed: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().required(),
      description: Joi.string().trim().allow('', null).optional()
    })
  ).optional(),
  impactNumbers: Joi.array().items(
    Joi.object({
      label: Joi.string().trim().required(),
      value: Joi.number().min(0).required(),
      suffix: Joi.string().trim().allow('', null).optional()
    })
  ).optional(),
  isActive: Joi.boolean().optional(),
  order: Joi.number().integer().min(0).optional()
});

module.exports = {
  createDurgaContentSchema,
  updateDurgaContentSchema
};
