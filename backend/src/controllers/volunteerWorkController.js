const volunteerWorkService = require('../services/volunteerWorkService');

/**
 * Submit work
 */
const submitWork = async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const submission = await volunteerWorkService.submitWork(
      req.body,
      req.volunteer._id,
      ipAddress
    );

    res.status(201).json({
      success: true,
      message: 'Work submitted successfully',
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit work'
    });
  }
};

/**
 * Get work submissions
 */
const getWorkSubmissions = async (req, res) => {
  try {
    const submissions = await volunteerWorkService.getWorkSubmissions(
      req.query,
      req.volunteer._id
    );

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get work submissions'
    });
  }
};

/**
 * Get work submission by ID
 */
const getWorkSubmissionById = async (req, res) => {
  try {
    const submission = await volunteerWorkService.getWorkSubmissionById(
      req.params.id,
      req.volunteer._id
    );

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Work submission not found'
    });
  }
};

module.exports = {
  submitWork,
  getWorkSubmissions,
  getWorkSubmissionById
};
