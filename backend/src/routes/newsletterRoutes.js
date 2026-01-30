const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
} = require('../validators/emailTemplateValidator');
const {
  listSubscribersSchema,
  sendNewsletterSchema,
} = require('../validators/newsletterValidator');
const emailTemplateController = require('../controllers/emailTemplateController');
const newsletterController = require('../controllers/newsletterController');

// Email template management (admin)
router.post(
  '/templates',
  authenticate,
  authorize('SETTINGS_UPDATE'),
  validate(createEmailTemplateSchema),
  emailTemplateController.createEmailTemplate
);

router.get(
  '/templates',
  authenticate,
  authorize('SETTINGS_READ'),
  emailTemplateController.getEmailTemplates
);

router.get(
  '/templates/:id',
  authenticate,
  authorize('SETTINGS_READ'),
  emailTemplateController.getEmailTemplateById
);

router.put(
  '/templates/:id',
  authenticate,
  authorize('SETTINGS_UPDATE'),
  validate(updateEmailTemplateSchema),
  emailTemplateController.updateEmailTemplate
);

router.delete(
  '/templates/:id',
  authenticate,
  authorize('SETTINGS_UPDATE'),
  emailTemplateController.deleteEmailTemplate
);

// Newsletter subscribers (admin)
router.get(
  '/subscribers',
  authenticate,
  authorize('SETTINGS_READ'),
  validate(listSubscribersSchema, 'query'),
  newsletterController.getSubscribers
);

// Send newsletter (admin)
router.post(
  '/send',
  authenticate,
  authorize('SETTINGS_UPDATE'),
  validate(sendNewsletterSchema),
  newsletterController.sendNewsletter
);

// Email logs (admin)
router.get(
  '/logs',
  authenticate,
  authorize('SETTINGS_READ'),
  newsletterController.getEmailLogs
);

module.exports = router;

