const notificationService = require('../services/notificationService');

/**
 * Get notifications for authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await notificationService.getNotifications(userId, req.query);

    res.status(200).json({
      success: true,
      data: notifications.data,
      pagination: notifications.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message
    });
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await notificationService.deleteNotification(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete all read notifications
 */
const deleteAllRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await notificationService.deleteAllRead(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete read notifications',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
};
