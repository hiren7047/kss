const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const multer = require('multer');

// Configure multer for file uploads (same as in controller)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const path = require('path');
    const fs = require('fs').promises;
    const uploadDir = path.join(__dirname, '../../uploads/forms');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const path = require('path');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `form-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const path = require('path');
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// GET /api/forms/public/token/:token - Get form by shareable token
router.get(
  '/token/:token',
  formController.getFormByToken
);

// GET /api/forms/public/slug/:slug - Get form by slug
router.get(
  '/slug/:slug',
  formController.getFormBySlug
);

// POST /api/forms/public/token/:token/submit - Submit form by token
router.post(
  '/token/:token/submit',
  upload.any(), // Accept any file fields
  formController.submitFormByToken
);

// POST /api/forms/public/:formId/submit - Submit form by ID (if formId is known)
router.post(
  '/:formId/submit',
  upload.any(), // Accept any file fields
  formController.submitForm
);

module.exports = router;
