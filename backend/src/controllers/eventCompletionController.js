const eventCompletionService = require('../services/eventCompletionService');

/**
 * Complete event and assign points
 */
const completeEventWithPoints = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await eventCompletionService.completeEventWithPoints(
      req.params.id,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: `Event completed successfully. Points assigned to ${result.pointsAssigned.length} volunteers.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event completion summary
 */
const getEventCompletionSummary = async (req, res, next) => {
  try {
    const summary = await eventCompletionService.getEventCompletionSummary(req.params.id);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  completeEventWithPoints,
  getEventCompletionSummary
};
