const volunteerLeaderboardService = require('../services/volunteerLeaderboardService');

/**
 * Get leaderboard
 */
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await volunteerLeaderboardService.getLeaderboard(req.query);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get leaderboard'
    });
  }
};

/**
 * Get volunteer's stats
 */
const getVolunteerStats = async (req, res) => {
  try {
    const stats = await volunteerLeaderboardService.getVolunteerStats(req.volunteer._id);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get volunteer stats'
    });
  }
};

/**
 * Get top volunteers
 */
const getTopVolunteers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topVolunteers = await volunteerLeaderboardService.getTopVolunteers(limit);

    res.status(200).json({
      success: true,
      data: topVolunteers
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get top volunteers'
    });
  }
};

module.exports = {
  getLeaderboard,
  getVolunteerStats,
  getTopVolunteers
};
