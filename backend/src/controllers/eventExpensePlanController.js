const eventExpensePlanService = require('../services/eventExpensePlanService');

/**
 * Create expense plan
 */
const createExpensePlan = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const plan = await eventExpensePlanService.createEventExpensePlan(req.body, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Expense plan created successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense plans
 */
const getExpensePlans = async (req, res, next) => {
  try {
    const result = await eventExpensePlanService.getEventExpensePlans(
      req.params.eventId || req.query.eventId, 
      req.query
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense plan by ID
 */
const getExpensePlanById = async (req, res, next) => {
  try {
    const plan = await eventExpensePlanService.getExpensePlanById(req.params.id);

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update expense plan
 */
const updateExpensePlan = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const plan = await eventExpensePlanService.updateExpensePlan(req.params.id, req.body, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Expense plan updated successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve expense plan
 */
const approveExpensePlan = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const plan = await eventExpensePlanService.approveExpensePlan(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Expense plan approved successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete expense plan
 */
const deleteExpensePlan = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await eventExpensePlanService.deleteExpensePlan(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Expense plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpensePlan,
  getExpensePlans,
  getExpensePlanById,
  updateExpensePlan,
  approveExpensePlan,
  deleteExpensePlan
};
