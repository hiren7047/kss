const Joi = require('joi');

const auditLogQuerySchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  module: Joi.string().valid('USER', 'MEMBER', 'DONATION', 'EXPENSE', 'EVENT', 'VOLUNTEER', 'WALLET', 'DOCUMENT', 'AUTH').optional(),
  action: Joi.string().valid('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

module.exports = {
  auditLogQuerySchema
};


