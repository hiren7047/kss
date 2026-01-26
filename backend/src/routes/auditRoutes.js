const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { auditLogQuerySchema } = require('../validators/auditValidator');

// GET /audit/logs
router.get(
  '/logs',
  authenticate,
  authorize('AUDIT_READ'),
  validate(auditLogQuerySchema, 'query'),
  auditController.getAuditLogs
);

module.exports = router;


