const express = require('express');
const router = express.Router();
const adminVolunteerManagementController = require('../controllers/adminVolunteerManagementController');
const { authenticate, authorize } = require('../middlewares/auth');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('VOLUNTEER_READ'));

// GET /admin/volunteers/:id/credentials - Get volunteer credentials
router.get(
  '/:id/credentials',
  adminVolunteerManagementController.getVolunteerCredentials
);

// PUT /admin/volunteers/:id/reset-password - Reset volunteer password
router.put(
  '/:id/reset-password',
  authorize('VOLUNTEER_UPDATE'),
  adminVolunteerManagementController.resetVolunteerPassword
);

// GET /admin/volunteers/:id/profile - Get complete volunteer profile
router.get(
  '/:id/profile',
  adminVolunteerManagementController.getVolunteerProfile
);

// GET /admin/volunteers/work-submissions - Get all work submissions
router.get(
  '/work-submissions',
  adminVolunteerManagementController.getAllWorkSubmissions
);

// GET /admin/volunteers/expenses - Get volunteer expenses
router.get(
  '/expenses',
  adminVolunteerManagementController.getVolunteerExpenses
);

module.exports = router;
