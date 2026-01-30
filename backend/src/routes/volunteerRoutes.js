const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const adminVolunteerWorkController = require('../controllers/adminVolunteerWorkController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { assignVolunteerSchema, updateAttendanceSchema } = require('../validators/volunteerValidator');
const { reviewWorkSubmissionSchema, verifyPointsSchema } = require('../validators/volunteerWorkValidator');

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

// Admin routes for volunteer work management
// GET /volunteers/work-submissions - Get all work submissions
router.get(
  '/work-submissions',
  authenticate,
  authorize('VOLUNTEER_READ'),
  adminVolunteerWorkController.getAllWorkSubmissions
);

// GET /volunteers/work-submissions/:id - Get work submission by ID
router.get(
  '/work-submissions/:id',
  authenticate,
  authorize('VOLUNTEER_READ'),
  adminVolunteerWorkController.getWorkSubmissionById
);

// PUT /volunteers/work-submissions/:id/review - Review work submission
router.put(
  '/work-submissions/:id/review',
  authenticate,
  authorize('VOLUNTEER_UPDATE'),
  validate(reviewWorkSubmissionSchema),
  adminVolunteerWorkController.reviewWorkSubmission
);

// PUT /volunteers/verify-points - Verify volunteer points
router.put(
  '/verify-points',
  authenticate,
  authorize('VOLUNTEER_UPDATE'),
  validate(verifyPointsSchema),
  adminVolunteerWorkController.verifyPoints
);

module.exports = router;


