const EventExpensePlan = require('../models/EventExpensePlan');
const Expense = require('../models/Expense');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

/**
 * Create event expense plan
 */
const createEventExpensePlan = async (planData, userId, ipAddress) => {
  const plan = await EventExpensePlan.create(planData);

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'EVENT_EXPENSE_PLAN',
    newData: plan.toObject(),
    ipAddress
  });

  return plan;
};

/**
 * Get all expense plans for an event
 */
const getEventExpensePlans = async (eventId, query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { eventId, softDelete: false };

  if (query.status) {
    filter.status = query.status;
  }
  if (query.priority) {
    filter.priority = query.priority;
  }

  const [plans, total] = await Promise.all([
    EventExpensePlan.find(filter)
      .populate('approvedBy', 'name email')
      .populate('expenseId', 'title amount')
      .sort({ plannedDate: 1, priority: -1 })
      .skip(skip)
      .limit(limit),
    EventExpensePlan.countDocuments(filter)
  ]);

  return createPaginationResponse(plans, total, page, limit);
};

/**
 * Get expense plan by ID
 */
const getExpensePlanById = async (id) => {
  const plan = await EventExpensePlan.findOne({ _id: id, softDelete: false })
    .populate('approvedBy', 'name email')
    .populate('expenseId', 'title amount');
  if (!plan) {
    throw new Error('Expense plan not found');
  }
  return plan;
};

/**
 * Update expense plan
 */
const updateExpensePlan = async (id, updateData, userId, ipAddress) => {
  const plan = await EventExpensePlan.findOne({ _id: id, softDelete: false });
  if (!plan) {
    throw new Error('Expense plan not found');
  }

  const oldData = plan.toObject();
  Object.assign(plan, updateData);
  await plan.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'EVENT_EXPENSE_PLAN',
    oldData,
    newData: plan.toObject(),
    ipAddress
  });

  return plan;
};

/**
 * Approve expense plan
 */
const approveExpensePlan = async (id, userId, ipAddress) => {
  const plan = await EventExpensePlan.findOne({ _id: id, softDelete: false });
  if (!plan) {
    throw new Error('Expense plan not found');
  }

  const oldData = plan.toObject();
  plan.isApproved = true;
  plan.approvedBy = userId;
  plan.approvedAt = new Date();
  await plan.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'APPROVE',
    module: 'EVENT_EXPENSE_PLAN',
    oldData,
    newData: plan.toObject(),
    ipAddress
  });

  return plan;
};

/**
 * Link expense plan to actual expense
 */
const linkExpenseToPlan = async (planId, expenseId) => {
  const plan = await EventExpensePlan.findOne({ _id: planId, softDelete: false });
  if (!plan) {
    throw new Error('Expense plan not found');
  }

  const expense = await Expense.findOne({ _id: expenseId, softDelete: false });
  if (!expense) {
    throw new Error('Expense not found');
  }

  plan.expenseId = expenseId;
  plan.actualAmount = expense.amount;
  plan.status = 'completed';
  await plan.save();

  return plan;
};

/**
 * Delete expense plan (soft delete)
 */
const deleteExpensePlan = async (id, userId, ipAddress) => {
  const plan = await EventExpensePlan.findOne({ _id: id, softDelete: false });
  if (!plan) {
    throw new Error('Expense plan not found');
  }

  const oldData = plan.toObject();
  plan.softDelete = true;
  await plan.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'EVENT_EXPENSE_PLAN',
    oldData,
    newData: plan.toObject(),
    ipAddress
  });

  return plan;
};

module.exports = {
  createEventExpensePlan,
  getEventExpensePlans,
  getExpensePlanById,
  updateExpensePlan,
  approveExpensePlan,
  linkExpenseToPlan,
  deleteExpensePlan
};
