const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentController = require('../controllers/documentController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { uploadDocumentSchema, documentQuerySchema } = require('../validators/documentValidator');
const { uploadDir, maxFileSize } = require('../config/env');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    // Allow PDF, images, and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// POST /documents/upload
router.post(
  '/upload',
  authenticate,
  authorize('DOCUMENT_CREATE'),
  upload.single('file'),
  validate(uploadDocumentSchema),
  documentController.uploadDocument
);

// GET /documents
router.get(
  '/',
  authenticate,
  authorize('DOCUMENT_READ'),
  validate(documentQuerySchema, 'query'),
  documentController.getDocuments
);

// GET /documents/:id
router.get(
  '/:id',
  authenticate,
  authorize('DOCUMENT_READ'),
  documentController.getDocumentById
);

// PUT /documents/:id (with optional file upload)
router.put(
  '/:id',
  authenticate,
  authorize('DOCUMENT_UPDATE'),
  upload.single('file'),
  validate(uploadDocumentSchema),
  documentController.updateDocument
);

// DELETE /documents/:id
router.delete(
  '/:id',
  authenticate,
  authorize('DOCUMENT_DELETE'),
  documentController.deleteDocument
);

module.exports = router;


