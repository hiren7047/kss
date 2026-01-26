const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
    index: true
  },
  // Store responses as key-value pairs where key is fieldId
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Store file uploads separately (if any)
  fileUploads: [{
    fieldId: String,
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String
  }],
  // Submitter information (optional, can be captured in form fields)
  submitterInfo: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  },
  // Status tracking
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'archived'],
    default: 'submitted',
    index: true
  },
  // Admin notes
  adminNotes: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  // Soft delete
  softDelete: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
formSubmissionSchema.index({ formId: 1, softDelete: 1 });
formSubmissionSchema.index({ status: 1, softDelete: 1 });
formSubmissionSchema.index({ createdAt: -1 });
formSubmissionSchema.index({ formId: 1, createdAt: -1 });

// Compound index for form analytics
formSubmissionSchema.index({ formId: 1, status: 1, softDelete: 1 });

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
