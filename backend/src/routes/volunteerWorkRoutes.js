const express = require('express');
const router = express.Router();
const volunteerWorkController = require('../controllers/volunteerWorkController');
const { authenticateVolunteer } = require('../middlewares/volunteerAuth');

// All routes require volunteer authentication
router.use(authenticateVolunteer);

// POST /volunteer-work/submit - Submit work
router.post('/submit', volunteerWorkController.submitWork);

// GET /volunteer-work - Get all work submissions (for logged-in volunteer)
router.get('/', volunteerWorkController.getWorkSubmissions);

// GET /volunteer-work/:id - Get work submission by ID
router.get('/:id', volunteerWorkController.getWorkSubmissionById);

module.exports = router;
