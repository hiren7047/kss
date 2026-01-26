const expenseService = require('../services/expenseService');

/**
 * Create expense
 */
const createExpense = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const expense = await expenseService.createExpense(req.body, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all expenses
 */
const getExpenses = async (req, res, next) => {
  try {
    const result = await expenseService.getExpenses(req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense by ID
 */
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject expense
 */
const approveExpense = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const expense = await expenseService.approveExpense(req.params.id, req.body, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: `Expense ${req.body.approvalStatus} successfully`,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense report
 */
const getExpenseReport = async (req, res, next) => {
  try {
    const report = await expenseService.getExpenseReport(req.query);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete expense (soft delete)
 */
const deleteExpense = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await expenseService.deleteExpense(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  approveExpense,
  getExpenseReport,
  deleteExpense
};


