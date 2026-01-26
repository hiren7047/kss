const eventService = require('../services/eventService');
const eventAnalyticsService = require('../services/eventAnalyticsService');

/**
 * Create event
 */
const createEvent = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const event = await eventService.createEvent(req.body, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events
 */
const getEvents = async (req, res, next) => {
  try {
    const result = await eventService.getEvents(req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event
 */
const updateEvent = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const event = await eventService.updateEvent(req.params.id, req.body, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event summary
 */
const getEventSummary = async (req, res, next) => {
  try {
    const summary = await eventService.getEventSummary(req.params.id);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event (soft delete)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await eventService.deleteEvent(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event financial analytics
 */
const getEventAnalytics = async (req, res, next) => {
  try {
    const analytics = await eventAnalyticsService.getEventFinancialAnalytics(req.params.id);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event dashboard
 */
const getEventDashboard = async (req, res, next) => {
  try {
    const dashboard = await eventAnalyticsService.getEventDashboard(req.params.id);

    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event items with donations
 */
const getEventItemsWithDonations = async (req, res, next) => {
  try {
    const items = await eventAnalyticsService.getEventItemsWithDonations(req.params.id);

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  getEventSummary,
  deleteEvent,
  getEventAnalytics,
  getEventDashboard,
  getEventItemsWithDonations
};


