const impactService = require('../services/impactService');

const getImpactNumbers = async (req, res, next) => {
  try {
    const impactNumbers = await impactService.getImpactNumbers(req.query.language);
    res.status(200).json({
      success: true,
      data: impactNumbers
    });
  } catch (error) {
    next(error);
  }
};

const updateImpactNumber = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const impactNumber = await impactService.updateImpactNumber(
      id,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Impact number updated successfully',
      data: impactNumber
    });
  } catch (error) {
    next(error);
  }
};

const bulkUpdateImpactNumbers = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const impactNumbers = await impactService.bulkUpdateImpactNumbers(
      req.body.impactNumbers,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Impact numbers updated successfully',
      data: impactNumbers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getImpactNumbers,
  updateImpactNumber,
  bulkUpdateImpactNumbers
};
