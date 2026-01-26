const Joi = require('joi');

const createPageContentSchema = Joi.object({
  pageId: Joi.string().valid('home', 'about', 'contact', 'donate', 'volunteer', 'durga', 'events', 'gallery').required(),
  language: Joi.string().valid('en', 'gu', 'hi').required(),
  sections: Joi.array().items(
    Joi.object({
      sectionId: Joi.string().required(),
      title: Joi.string().trim().allow('', null).optional(),
      subtitle: Joi.string().trim().allow('', null).optional(),
      content: Joi.string().trim().allow('', null).optional(),
      imageUrl: Joi.string().uri().allow('', null).optional(),
      order: Joi.number().integer().min(0).optional(),
      isActive: Joi.boolean().optional()
    })
  ).optional(),
  metaTags: Joi.object({
    title: Joi.string().trim().allow('', null).optional(),
    description: Joi.string().trim().allow('', null).optional(),
    keywords: Joi.string().trim().allow('', null).optional(),
    ogImage: Joi.string().uri().allow('', null).optional()
  }).optional(),
  status: Joi.string().valid('draft', 'published', 'archived').optional()
});

const updatePageContentSchema = Joi.object({
  sections: Joi.array().items(
    Joi.object({
      sectionId: Joi.string().required(),
      title: Joi.string().trim().allow('', null).optional(),
      subtitle: Joi.string().trim().allow('', null).optional(),
      content: Joi.string().trim().allow('', null).optional(),
      imageUrl: Joi.string().uri().allow('', null).optional(),
      order: Joi.number().integer().min(0).optional(),
      isActive: Joi.boolean().optional()
    })
  ).optional(),
  metaTags: Joi.object({
    title: Joi.string().trim().allow('', null).optional(),
    description: Joi.string().trim().allow('', null).optional(),
    keywords: Joi.string().trim().allow('', null).optional(),
    ogImage: Joi.string().uri().allow('', null).optional()
  }).optional(),
  status: Joi.string().valid('draft', 'published', 'archived').optional()
});

const publishPageContentSchema = Joi.object({
  changeReason: Joi.string().trim().allow('', null).optional()
});

module.exports = {
  createPageContentSchema,
  updatePageContentSchema,
  publishPageContentSchema
};
