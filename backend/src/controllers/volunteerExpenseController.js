const expenseService = require('../services/expenseService');

/**
 * Submit expense (volunteer)
 */
const submitExpense = async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const expense = await expenseService.createExpense(
      req.body,
      null, // No admin userId
      ipAddress,
      req.volunteer._id // Volunteer ID
    );

    res.status(201).json({
      success: true,
      message: 'Expense submitted successfully. Waiting for admin approval.',
      data: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit expense'
    });
  }
};

/**
 * Get volunteer's submitted expenses
 */
const getMyExpenses = async (req, res) => {
  try {
    const query = {
      ...req.query,
      submittedBy: req.volunteer._id.toString()
    };
    const expenses = await expenseService.getExpenses(query);

    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get expenses'
    });
  }
};

/**
 * Get expense by ID (only if submitted by this volunteer)
 */
const getExpenseById = async (req, res) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);

    // Check if expense was submitted by this volunteer
    if (expense.submittedBy && expense.submittedBy._id.toString() !== req.volunteer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own expenses'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Expense not found'
    });
  }
};

module.exports = {
  submitExpense,
  getMyExpenses,
  getExpenseById
};
