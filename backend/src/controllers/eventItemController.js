const eventItemService = require('../services/eventItemService');

/**
 * Create event item
 */
const createEventItem = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const item = await eventItemService.createEventItem(req.body, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Event item created successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event items
 */
const getEventItems = async (req, res, next) => {
  try {
    const result = await eventItemService.getEventItems(req.params.eventId || req.query.eventId, req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event item by ID
 */
const getEventItemById = async (req, res, next) => {
  try {
    const item = await eventItemService.getEventItemById(req.params.id);

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event item
 */
const updateEventItem = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const item = await eventItemService.updateEventItem(req.params.id, req.body, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Event item updated successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event item
 */
const deleteEventItem = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await eventItemService.deleteEventItem(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Event item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get item donations
 */
const getItemDonations = async (req, res, next) => {
  try {
    const result = await eventItemService.getItemDonations(req.params.id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEventItem,
  getEventItems,
  getEventItemById,
  updateEventItem,
  deleteEventItem,
  getItemDonations
};
