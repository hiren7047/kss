const Notification = require('../models/Notification');
const User = require('../models/User');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

/**
 * Create a notification
 */
const createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);
  return notification;
};

/**
 * Create notifications for multiple users (e.g., all admins)
 */
const createNotificationForAdmins = async (notificationData, roles = ['SUPER_ADMIN', 'ADMIN']) => {
  const admins = await User.find({ 
    role: { $in: roles },
    status: 'active'
  }).select('_id');

  const notifications = admins.map(admin => ({
    ...notificationData,
    userId: admin._id
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};

/**
 * Create notification for specific user
 */
const createNotificationForUser = async (userId, notificationData) => {
  const notification = await Notification.create({
    ...notificationData,
    userId
  });
  return notification;
};

/**
 * Get notifications for a user
 */
const getNotifications = async (userId, query = {}) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { userId };

  // Filter by read status
  if (query.isRead !== undefined) {
    filter.isRead = query.isRead === 'true';
  }

  // Filter by type
  if (query.type) {
    filter.type = query.type;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter)
  ]);

  return createPaginationResponse(notifications, total, page, limit);
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    userId,
    isRead: false
  });
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );
  return result.modifiedCount;
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
};

/**
 * Delete all read notifications for a user
 */
const deleteAllRead = async (userId) => {
  const result = await Notification.deleteMany({
    userId,
    isRead: true
  });
  return result.deletedCount;
};

module.exports = {
  createNotification,
  createNotificationForAdmins,
  createNotificationForUser,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
};
