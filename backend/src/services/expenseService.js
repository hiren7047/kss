const Expense = require('../models/Expense');
const Wallet = require('../models/Wallet');
const { createAuditLog } = require('../utils/auditLogger');
const { updateWalletAfterExpense, recalculateWallet } = require('../utils/walletUpdater');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const { createDateRangeFilter } = require('../utils/dateFilters');
const { notifyExpensePending, notifyExpenseStatus } = require('../utils/notificationHelper');

/**
 * Create a new expense
 */
const createExpense = async (expenseData, userId, ipAddress, volunteerId = null) => {
  const expense = await Expense.create({
    ...expenseData,
    submittedBy: volunteerId || null,
    approvalStatus: 'pending'
  });

  // Create audit log
  await createAuditLog({
    userId: userId || null,
    action: 'CREATE',
    module: 'EXPENSE',
    newData: expense.toObject(),
    ipAddress,
    notes: volunteerId ? 'Expense submitted by volunteer' : null
  });

  // Create notification for admins/accountants
  try {
    await notifyExpensePending(expense);
  } catch (error) {
    console.error('Error creating expense notification:', error);
    // Don't fail expense creation if notification fails
  }

  return expense;
};

/**
 * Get all expenses with pagination and filters
 */
const getExpenses = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  // Apply filters
  if (query.approvalStatus) {
    filter.approvalStatus = query.approvalStatus;
  }
  if (query.category) {
    filter.category = query.category;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }

  // Search filter (title, category)
  if (query.search) {
    const searchRegex = { $regex: query.search, $options: 'i' };
    filter.$or = [
      { title: searchRegex },
      { category: searchRegex }
    ];
  }

  // Date range filter
  const dateFilter = createDateRangeFilter(query.startDate, query.endDate);
  Object.assign(filter, dateFilter);

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate('eventId', 'name')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter)
  ]);

  return createPaginationResponse(expenses, total, page, limit);
};

/**
 * Get expense by ID
 */
const getExpenseById = async (id) => {
  const expense = await Expense.findOne({ _id: id, softDelete: false })
    .populate('eventId', 'name')
    .populate('submittedBy', 'name memberId registrationId')
    .populate('approvedBy', 'name email');
  
  if (!expense) {
    throw new Error('Expense not found');
  }
  return expense;
};

/**
 * Approve or reject expense
 */
const approveExpense = async (id, approvalData, userId, ipAddress) => {
  const expense = await Expense.findOne({ _id: id, softDelete: false });
  if (!expense) {
    throw new Error('Expense not found');
  }

  if (expense.approvalStatus !== 'pending') {
    throw new Error('Expense has already been processed');
  }

  const oldData = expense.toObject();

  // Check wallet balance if approving
  if (approvalData.approvalStatus === 'approved') {
    const wallet = await Wallet.getWallet();
    if (wallet.availableBalance < expense.amount) {
      throw new Error('Insufficient balance to approve this expense');
    }

    expense.approvedBy = userId;
    expense.approvalStatus = 'approved';
    await expense.save();

    // Update wallet
    await updateWalletAfterExpense(expense.amount);
  } else {
    expense.approvalStatus = 'rejected';
    expense.rejectionReason = approvalData.rejectionReason || null;
    await expense.save();
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: approvalData.approvalStatus === 'approved' ? 'APPROVE' : 'REJECT',
    module: 'EXPENSE',
    oldData,
    newData: expense.toObject(),
    ipAddress
  });

  // Create notification for expense submitter
  try {
    await notifyExpenseStatus(expense, approvalData.approvalStatus, userId);
  } catch (error) {
    console.error('Error creating expense status notification:', error);
    // Don't fail expense approval if notification fails
  }

  return expense;
};

/**
 * Get expense report
 */
const getExpenseReport = async (query) => {
  const filter = { softDelete: false };

  // Apply filters
  if (query.category) {
    filter.category = query.category;
  }
  if (query.approvalStatus) {
    filter.approvalStatus = query.approvalStatus;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }

  // Date range filter
  const dateFilter = createDateRangeFilter(query.startDate, query.endDate);
  Object.assign(filter, dateFilter);

  const expenses = await Expense.find(filter)
    .populate('eventId', 'name')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

  // Calculate totals
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = expenses.length;

  // Group by category
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  // Group by approval status
  const byStatus = expenses.reduce((acc, e) => {
    acc[e.approvalStatus] = (acc[e.approvalStatus] || 0) + e.amount;
    return acc;
  }, {});

  // Only approved expenses count
  const approvedAmount = expenses
    .filter(e => e.approvalStatus === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    summary: {
      totalAmount,
      totalCount,
      approvedAmount,
      pendingAmount: totalAmount - approvedAmount
    },
    byCategory,
    byStatus,
    expenses
  };
};

/**
 * Soft delete expense
 */
const deleteExpense = async (id, userId, ipAddress) => {
  const expense = await Expense.findOne({ _id: id, softDelete: false });
  if (!expense) {
    throw new Error('Expense not found');
  }

  const oldData = expense.toObject();
  expense.softDelete = true;
  await expense.save();

  // Recalculate wallet if expense was approved
  if (expense.approvalStatus === 'approved') {
    await recalculateWallet();
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'EXPENSE',
    oldData,
    newData: expense.toObject(),
    ipAddress
  });

  return expense;
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  approveExpense,
  getExpenseReport,
  deleteExpense
};


