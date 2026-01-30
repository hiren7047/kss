const express = require('express');
const router = express.Router();
const volunteerAuthController = require('../controllers/volunteerAuthController');
const { authenticateVolunteer } = require('../middlewares/volunteerAuth');
const { authLimiter } = require('../middlewares/rateLimiter');

// POST /volunteer-auth/login - Public route
router.post('/login', authLimiter, volunteerAuthController.login);

// GET /volunteer-auth/profile - Protected route
router.get('/profile', authenticateVolunteer, volunteerAuthController.getProfile);

// PUT /volunteer-auth/change-password - Protected route
router.put('/change-password', authenticateVolunteer, volunteerAuthController.changePassword);

module.exports = router;
