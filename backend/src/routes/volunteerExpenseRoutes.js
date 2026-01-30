const express = require('express');
const router = express.Router();
const volunteerExpenseController = require('../controllers/volunteerExpenseController');
const { authenticateVolunteer } = require('../middlewares/volunteerAuth');
const validate = require('../validators');
const { createExpenseSchema, expenseReportSchema } = require('../validators/expenseValidator');

// All routes require volunteer authentication
router.use(authenticateVolunteer);

// POST /volunteer-expenses/submit - Submit expense
router.post('/submit', validate(createExpenseSchema), volunteerExpenseController.submitExpense);

// GET /volunteer-expenses - Get volunteer's expenses
router.get('/', validate(expenseReportSchema, 'query'), volunteerExpenseController.getMyExpenses);

// GET /volunteer-expenses/:id - Get expense by ID
router.get('/:id', volunteerExpenseController.getExpenseById);

module.exports = router;
