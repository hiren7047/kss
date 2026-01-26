const Joi = require('joi');

const createGalleryItemSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null).optional(),
  type: Joi.string().valid('photo', 'video').required(),
  fileUrl: Joi.string().uri().required(),
  thumbnailUrl: Joi.string().uri().allow('', null).optional(),
  category: Joi.string().valid('annapurna', 'ganga', 'kali', 'saraswati', 'events', 'general').required(),
  durgaId: Joi.string().valid('saraswati', 'annapurna', 'ganga', 'kali', 'lakshmi').allow('', null).optional(),
  eventId: Joi.string().hex().length(24).allow('', null).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  isFeatured: Joi.boolean().optional(),
  displayOrder: Joi.number().integer().min(0).optional()
});

const updateGalleryItemSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().allow('', null).optional(),
  thumbnailUrl: Joi.string().uri().allow('', null).optional(),
  category: Joi.string().valid('annapurna', 'ganga', 'kali', 'saraswati', 'events', 'general').optional(),
  durgaId: Joi.string().valid('saraswati', 'annapurna', 'ganga', 'kali', 'lakshmi').allow('', null).optional(),
  eventId: Joi.string().hex().length(24).allow('', null).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  isFeatured: Joi.boolean().optional(),
  displayOrder: Joi.number().integer().min(0).optional()
});

module.exports = {
  createGalleryItemSchema,
  updateGalleryItemSchema
};
