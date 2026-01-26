const formService = require('../services/formService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/forms');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
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
    // Allow common file types
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

/**
 * Create form
 */
const createForm = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const form = await formService.createForm(req.body, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: form
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all forms
 */
const getForms = async (req, res, next) => {
  try {
    const result = await formService.getForms(req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get form by ID
 */
const getFormById = async (req, res, next) => {
  try {
    const form = await formService.getFormById(req.params.id);

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get form by token (public)
 */
const getFormByToken = async (req, res, next) => {
  try {
    const form = await formService.getFormByToken(req.params.token);

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get form by slug (public)
 */
const getFormBySlug = async (req, res, next) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update form
 */
const updateForm = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const form = await formService.updateForm(req.params.id, req.body, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Form updated successfully',
      data: form
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit form (public endpoint)
 */
const submitForm = async (req, res, next) => {
  try {
    const { formId } = req.params;
    let { responses } = req.body;

    // Parse responses if it's a JSON string (from FormData)
    if (typeof responses === 'string') {
      try {
        responses = JSON.parse(responses);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid responses format'
        });
      }
    }

    // Responses come as an object from JSON, keep it as object for service
    // Service will convert to Map internally

    // Handle file uploads
    const fileUploads = [];
    if (req.files) {
      for (const [fieldId, files] of Object.entries(req.files)) {
        const fileArray = Array.isArray(files) ? files : [files];
        fileArray.forEach(file => {
          fileUploads.push({
            fieldId: fieldId,
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype
          });
        });
      }
    }

    // Get submitter info
    const submitterInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      referrer: req.get('referer')
    };

    const submission = await formService.submitForm(
      formId,
      { responses: responses || {} },
      fileUploads,
      submitterInfo
    );

    // Get form to return success message
    const form = await formService.getFormById(formId);

    res.status(201).json({
      success: true,
      message: form.successMessage || 'Thank you for your submission!',
      data: {
        submissionId: submission._id,
        redirectUrl: form.redirectUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit form by token (public endpoint)
 */
const submitFormByToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Get form by token first
    const form = await formService.getFormByToken(token);
    
    // Then submit using formId
    req.params.formId = form._id.toString();
    return submitForm(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Get form submissions
 */
const getFormSubmissions = async (req, res, next) => {
  try {
    const result = await formService.getFormSubmissions(req.params.id, req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get submission by ID
 */
const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await formService.getSubmissionById(req.params.submissionId);

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update submission
 */
const updateSubmission = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const submission = await formService.updateSubmission(
      req.params.submissionId,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Submission updated successfully',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get form analytics
 */
const getFormAnalytics = async (req, res, next) => {
  try {
    const analytics = await formService.getFormAnalytics(req.params.id);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete form (soft delete)
 */
const deleteForm = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await formService.deleteForm(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete submission (soft delete)
 */
const deleteSubmission = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await formService.deleteSubmission(req.params.submissionId, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createForm,
  getForms,
  getFormById,
  getFormByToken,
  getFormBySlug,
  updateForm,
  submitForm,
  submitFormByToken,
  getFormSubmissions,
  getSubmissionById,
  updateSubmission,
  getFormAnalytics,
  deleteForm,
  deleteSubmission,
  upload // Export upload middleware for use in routes
};
