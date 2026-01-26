const express = require('express');
const router = express.Router();
const eventExpensePlanController = require('../controllers/eventExpensePlanController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { createExpensePlanSchema, updateExpensePlanSchema } = require('../validators/eventExpensePlanValidator');

// POST /event-expense-plans
router.post(
  '/',
  authenticate,
  authorize('EVENT_CREATE'),
  validate(createExpensePlanSchema),
  eventExpensePlanController.createExpensePlan
);

// GET /event-expense-plans/event/:eventId
router.get(
  '/event/:eventId',
  authenticate,
  authorize('EVENT_READ'),
  eventExpensePlanController.getExpensePlans
);

// GET /event-expense-plans (with query param eventId)
router.get(
  '/',
  authenticate,
  authorize('EVENT_READ'),
  eventExpensePlanController.getExpensePlans
);

// GET /event-expense-plans/:id
router.get(
  '/:id',
  authenticate,
  authorize('EVENT_READ'),
  eventExpensePlanController.getExpensePlanById
);

// PUT /event-expense-plans/:id
router.put(
  '/:id',
  authenticate,
  authorize('EVENT_UPDATE'),
  validate(updateExpensePlanSchema),
  eventExpensePlanController.updateExpensePlan
);

// PUT /event-expense-plans/:id/approve
router.put(
  '/:id/approve',
  authenticate,
  authorize('EXPENSE_APPROVE'),
  eventExpensePlanController.approveExpensePlan
);

// DELETE /event-expense-plans/:id
router.delete(
  '/:id',
  authenticate,
  authorize('EVENT_DELETE'),
  eventExpensePlanController.deleteExpensePlan
);

module.exports = router;
