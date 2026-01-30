const express = require('express');
const router = express.Router();
const whatsAppController = require('../controllers/whatsAppController');
const { authenticate, authorize } = require('../middlewares/auth');

// Template routes
router.post(
  '/templates',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  whatsAppController.createTemplate
);

router.get(
  '/templates',
  authenticate,
  whatsAppController.getTemplates
);

router.get(
  '/templates/:id',
  authenticate,
  whatsAppController.getTemplateById
);

router.put(
  '/templates/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  whatsAppController.updateTemplate
);

router.delete(
  '/templates/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  whatsAppController.deleteTemplate
);

// Message routes
router.post(
  '/send',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  whatsAppController.sendMessage
);

router.post(
  '/send-bulk',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  whatsAppController.sendBulkMessages
);

router.get(
  '/messages',
  authenticate,
  whatsAppController.getMessages
);

router.get(
  '/statistics',
  authenticate,
  whatsAppController.getMessageStatistics
);

module.exports = router;
