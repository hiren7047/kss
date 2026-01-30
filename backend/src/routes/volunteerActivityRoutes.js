const express = require('express');
const router = express.Router();
const volunteerActivityController = require('../controllers/volunteerActivityController');
const { authenticateVolunteer } = require('../middlewares/volunteerAuth');

// All routes require volunteer authentication
router.use(authenticateVolunteer);

// GET /volunteer-activities - Get volunteer's activities
router.get('/', volunteerActivityController.getActivities);

// GET /volunteer-activities/summary - Get activity summary
router.get('/summary', volunteerActivityController.getActivitySummary);

module.exports = router;
