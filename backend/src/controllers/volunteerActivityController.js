const volunteerActivityService = require('../services/volunteerActivityService');

/**
 * Get volunteer activities
 */
const getActivities = async (req, res) => {
  try {
    const activities = await volunteerActivityService.getVolunteerActivities(
      req.volunteer._id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get activities'
    });
  }
};

/**
 * Get activity summary
 */
const getActivitySummary = async (req, res) => {
  try {
    const summary = await volunteerActivityService.getVolunteerActivitySummary(req.volunteer._id);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get activity summary'
    });
  }
};

module.exports = {
  getActivities,
  getActivitySummary
};
