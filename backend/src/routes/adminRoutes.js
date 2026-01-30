const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { deleteAllData } = require('../controllers/adminController');

/**
 * @route   DELETE /api/admin/database/reset
 * @desc    Delete all data from database (SUPER_ADMIN only)
 * @access  Private - SUPER_ADMIN only
 */
router.delete(
  '/database/reset',
  authenticate,
  authorize('DB_RESET'),
  deleteAllData
);

module.exports = router;
