const Joi = require('joi');

const createExpenseSchema = Joi.object({
  title: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  amount: Joi.number().positive().required(),
  eventId: Joi.string().hex().length(24).allow('', null).optional(),
  billUrl: Joi.string().uri().allow('', null).optional()
});

const approveExpenseSchema = Joi.object({
  approvalStatus: Joi.string().valid('approved', 'rejected').required(),
  rejectionReason: Joi.string().trim().allow('', null).optional()
});

const expenseReportSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  category: Joi.string().trim().optional(),
  approvalStatus: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

module.exports = {
  createExpenseSchema,
  approveExpenseSchema,
  expenseReportSchema
};


