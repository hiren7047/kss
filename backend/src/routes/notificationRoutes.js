const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} = require('../controllers/notificationController');

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for authenticated user
 * @access  Private
 */
router.get('/', authenticate, getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticate, getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticate, deleteNotification);

/**
 * @route   DELETE /api/notifications/read-all
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/read-all', authenticate, deleteAllRead);

module.exports = router;
