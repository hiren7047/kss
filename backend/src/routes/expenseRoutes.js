const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { createExpenseSchema, approveExpenseSchema, expenseReportSchema } = require('../validators/expenseValidator');

// POST /expenses
router.post(
  '/',
  authenticate,
  authorize('EXPENSE_CREATE'),
  validate(createExpenseSchema),
  expenseController.createExpense
);

// GET /expenses
router.get(
  '/',
  authenticate,
  authorize('EXPENSE_READ'),
  validate(expenseReportSchema, 'query'),
  expenseController.getExpenses
);

// GET /expenses/report
router.get(
  '/report',
  authenticate,
  authorize('EXPENSE_READ'),
  validate(expenseReportSchema, 'query'),
  expenseController.getExpenseReport
);

// GET /expenses/:id
router.get(
  '/:id',
  authenticate,
  authorize('EXPENSE_READ'),
  expenseController.getExpenseById
);

// PUT /expenses/:id/approve
router.put(
  '/:id/approve',
  authenticate,
  authorize('EXPENSE_APPROVE'),
  validate(approveExpenseSchema),
  expenseController.approveExpense
);

// DELETE /expenses/:id
router.delete(
  '/:id',
  authenticate,
  authorize('EXPENSE_DELETE'),
  expenseController.deleteExpense
);

module.exports = router;


