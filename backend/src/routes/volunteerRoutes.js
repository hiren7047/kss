const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { assignVolunteerSchema, updateAttendanceSchema } = require('../validators/volunteerValidator');

// POST /volunteers/assign
router.post(
  '/assign',
  authenticate,
  authorize('VOLUNTEER_CREATE'),
  validate(assignVolunteerSchema),
  volunteerController.assignVolunteer
);

// GET /volunteers/assignments - Get all assignments with filters
router.get(
  '/assignments',
  authenticate,
  authorize('VOLUNTEER_READ'),
  volunteerController.getAllAssignments
);

// GET /volunteers/event/:id
router.get(
  '/event/:id',
  authenticate,
  authorize('VOLUNTEER_READ'),
  volunteerController.getVolunteersByEvent
);

// GET /volunteers/volunteer/:id - Get assignments by volunteer
router.get(
  '/volunteer/:id',
  authenticate,
  authorize('VOLUNTEER_READ'),
  volunteerController.getAssignmentsByVolunteer
);

// PUT /volunteers/:id/attendance
router.put(
  '/:id/attendance',
  authenticate,
  authorize('VOLUNTEER_UPDATE'),
  validate(updateAttendanceSchema),
  volunteerController.updateAttendance
);

// DELETE /volunteers/:id
router.delete(
  '/:id',
  authenticate,
  authorize('VOLUNTEER_DELETE'),
  volunteerController.removeVolunteer
);

module.exports = router;


