const express = require('express');
const router = express.Router();
const eventItemController = require('../controllers/eventItemController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { createEventItemSchema, updateEventItemSchema } = require('../validators/eventItemValidator');

// POST /event-items
router.post(
  '/',
  authenticate,
  authorize('EVENT_CREATE'),
  eventItemController.createEventItem
);

// GET /event-items/event/:eventId
router.get(
  '/event/:eventId',
  authenticate,
  authorize('EVENT_READ'),
  eventItemController.getEventItems
);

// GET /event-items (with query param eventId)
router.get(
  '/',
  authenticate,
  authorize('EVENT_READ'),
  eventItemController.getEventItems
);

// GET /event-items/:id
router.get(
  '/:id',
  authenticate,
  authorize('EVENT_READ'),
  eventItemController.getEventItemById
);

// PUT /event-items/:id
router.put(
  '/:id',
  authenticate,
  authorize('EVENT_UPDATE'),
  validate(updateEventItemSchema),
  eventItemController.updateEventItem
);

// DELETE /event-items/:id
router.delete(
  '/:id',
  authenticate,
  authorize('EVENT_DELETE'),
  eventItemController.deleteEventItem
);

// GET /event-items/:id/donations
router.get(
  '/:id/donations',
  authenticate,
  authorize('EVENT_READ'),
  eventItemController.getItemDonations
);

module.exports = router;
