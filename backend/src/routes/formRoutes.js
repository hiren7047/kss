const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { 
  createFormSchema, 
  updateFormSchema, 
  submitFormSchema,
  updateSubmissionSchema 
} = require('../validators/formValidator');

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

// POST /api/forms - Create form
router.post(
  '/',
  authenticate,
  authorize('FORM_CREATE'),
  validate(createFormSchema),
  formController.createForm
);

// GET /api/forms - Get all forms
router.get(
  '/',
  authenticate,
  authorize('FORM_READ'),
  formController.getForms
);

// GET /api/forms/:id - Get form by ID
router.get(
  '/:id',
  authenticate,
  authorize('FORM_READ'),
  formController.getFormById
);

// PUT /api/forms/:id - Update form
router.put(
  '/:id',
  authenticate,
  authorize('FORM_UPDATE'),
  validate(updateFormSchema),
  formController.updateForm
);

// DELETE /api/forms/:id - Delete form (soft delete)
router.delete(
  '/:id',
  authenticate,
  authorize('FORM_DELETE'),
  formController.deleteForm
);

// GET /api/forms/:id/submissions - Get form submissions
router.get(
  '/:id/submissions',
  authenticate,
  authorize('FORM_SUBMISSION_READ'),
  formController.getFormSubmissions
);

// GET /api/forms/:id/analytics - Get form analytics
router.get(
  '/:id/analytics',
  authenticate,
  authorize('FORM_READ'),
  formController.getFormAnalytics
);

// GET /api/forms/:id/submissions/:submissionId - Get submission by ID
router.get(
  '/:id/submissions/:submissionId',
  authenticate,
  authorize('FORM_SUBMISSION_READ'),
  formController.getSubmissionById
);

// PUT /api/forms/:id/submissions/:submissionId - Update submission
router.put(
  '/:id/submissions/:submissionId',
  authenticate,
  authorize('FORM_SUBMISSION_UPDATE'),
  validate(updateSubmissionSchema),
  formController.updateSubmission
);

// DELETE /api/forms/:id/submissions/:submissionId - Delete submission
router.delete(
  '/:id/submissions/:submissionId',
  authenticate,
  authorize('FORM_SUBMISSION_DELETE'),
  formController.deleteSubmission
);

module.exports = router;
