const volunteerWorkService = require('../services/volunteerWorkService');

/**
 * Get all work submissions (admin)
 */
const getAllWorkSubmissions = async (req, res, next) => {
  try {
    const submissions = await volunteerWorkService.getWorkSubmissions(req.query);

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get work submission by ID (admin)
 */
const getWorkSubmissionById = async (req, res, next) => {
  try {
    const submission = await volunteerWorkService.getWorkSubmissionById(req.params.id);

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review work submission (admin)
 */
const reviewWorkSubmission = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const submission = await volunteerWorkService.reviewWorkSubmission(
      req.params.id,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: `Work submission ${req.body.status} successfully`,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify points (admin)
 */
const verifyPoints = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { volunteerId, pointsToVerify } = req.body;

    if (!volunteerId || !pointsToVerify) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer ID and points to verify are required'
      });
    }

    const result = await volunteerWorkService.verifyPoints(
      volunteerId,
      pointsToVerify,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Points verified successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllWorkSubmissions,
  getWorkSubmissionById,
  reviewWorkSubmission,
  verifyPoints
};
