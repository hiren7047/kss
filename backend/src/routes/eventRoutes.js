const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { createEventSchema, updateEventSchema } = require('../validators/eventValidator');

// POST /events
router.post(
  '/',
  authenticate,
  authorize('EVENT_CREATE'),
  validate(createEventSchema),
  eventController.createEvent
);

// GET /events
router.get(
  '/',
  authenticate,
  authorize('EVENT_READ'),
  eventController.getEvents
);

// GET /events/:id
router.get(
  '/:id',
  authenticate,
  authorize('EVENT_READ'),
  eventController.getEventById
);

// GET /events/:id/summary
router.get(
  '/:id/summary',
  authenticate,
  authorize('EVENT_READ'),
  eventController.getEventSummary
);

// PUT /events/:id
router.put(
  '/:id',
  authenticate,
  authorize('EVENT_UPDATE'),
  validate(updateEventSchema),
  eventController.updateEvent
);

// DELETE /events/:id
router.delete(
  '/:id',
  authenticate,
  authorize('EVENT_DELETE'),
  eventController.deleteEvent
);

// GET /events/:id/analytics
router.get(
  '/:id/analytics',
  authenticate,
  authorize('EVENT_READ'),
  eventController.getEventAnalytics
);

// GET /events/:id/dashboard
router.get(
  '/:id/dashboard',
  authenticate,
  authorize('EVENT_READ'),
  eventController.getEventDashboard
);

// GET /events/:id/items
router.get(
  '/:id/items',
  authenticate,
  authorize('EVENT_READ'),
  eventController.getEventItemsWithDonations
);

module.exports = router;


