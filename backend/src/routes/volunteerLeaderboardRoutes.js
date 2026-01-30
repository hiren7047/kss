const express = require('express');
const router = express.Router();
const volunteerLeaderboardController = require('../controllers/volunteerLeaderboardController');
const { authenticateVolunteer } = require('../middlewares/volunteerAuth');

// GET /volunteer-leaderboard - Public leaderboard (no auth required)
router.get('/', volunteerLeaderboardController.getLeaderboard);

// GET /volunteer-leaderboard/stats - Get volunteer's own stats (auth required)
router.get('/stats', authenticateVolunteer, volunteerLeaderboardController.getVolunteerStats);

// GET /volunteer-leaderboard/top - Get top N volunteers (public)
router.get('/top', volunteerLeaderboardController.getTopVolunteers);

module.exports = router;
