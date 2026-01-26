const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/permissions');

// GET /admin/dashboard/stats
router.get(
  '/stats',
  authenticate,
  (req, res, next) => {
    // Allow all authenticated users to view dashboard stats
    next();
  },
  dashboardController.getDashboardStats
);

module.exports = router;
