const mongoose = require('mongoose');
const crypto = require('crypto');

const formFieldSchema = new mongoose.Schema({
  fieldId: {
    type: String,
    required: true // Unique identifier for the field within the form
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'email', 'phone', 'number', 'date', 'textarea', 'select', 'checkbox', 'radio', 'file'],
    required: true
  },
  placeholder: {
    type: String,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    // For select, radio, checkbox types
    label: String,
    value: String
  }],
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String, // Regex pattern
    customMessage: String
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Form title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    index: true
  },
  fields: {
    type: [formFieldSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Form must have at least one field'
    }
  },
  // Shareable link configuration
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  shareableToken: {
    type: String,
    unique: true,
    required: false // Auto-generated in pre-save hook
  },
  // Form settings
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'closed'],
    default: 'draft',
    index: true
  },
  allowMultipleSubmissions: {
    type: Boolean,
    default: false
  },
  maxSubmissions: {
    type: Number,
    default: null // null means unlimited
  },
  startDate: {
    type: Date,
    default: null // null means no start date restriction
  },
  endDate: {
    type: Date,
    default: null // null means no end date restriction
  },
  // Success message after submission
  successMessage: {
    type: String,
    default: 'Thank you for your submission!'
  },
  // Redirect URL after submission (optional)
  redirectUrl: {
    type: String,
    trim: true
  },
  // Form metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissionCount: {
    type: Number,
    default: 0
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

// Generate unique shareable token before saving
formSchema.pre('save', async function(next) {
  // Always generate token if not set (for new documents or updates)
  if (!this.shareableToken || this.shareableToken.trim() === '') {
    // Generate a unique token
    let token;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      token = crypto.randomBytes(16).toString('hex');
      const existingForm = await this.constructor.findOne({ 
        shareableToken: token,
        _id: { $ne: this._id } // Exclude current document when updating
      });
      if (!existingForm) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      return next(new Error('Failed to generate unique shareable token'));
    }
    
    this.shareableToken = token;
  }
  
  // Generate slug from title if not provided
  if (!this.slug && this.title) {
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    // Ensure slug is unique
    let slug = baseSlug;
    let slugCounter = 1;
    let slugIsUnique = false;
    
    while (!slugIsUnique) {
      const existingForm = await this.constructor.findOne({ 
        slug: slug,
        _id: { $ne: this._id }
      });
      if (!existingForm) {
        slugIsUnique = true;
      } else {
        slug = `${baseSlug}-${slugCounter}`;
        slugCounter++;
      }
    }
    
    this.slug = slug;
  }
  
  next();
});

// Indexes for efficient queries
formSchema.index({ eventId: 1, softDelete: 1 });
formSchema.index({ status: 1, softDelete: 1 });
formSchema.index({ createdBy: 1, softDelete: 1 });
formSchema.index({ shareableToken: 1 });
formSchema.index({ slug: 1 });

// Virtual for public form URL
formSchema.virtual('publicUrl').get(function() {
  return `/api/forms/public/${this.shareableToken}`;
});

// Method to check if form is currently accepting submissions
formSchema.methods.isAcceptingSubmissions = function() {
  // Allow draft and active forms to accept submissions
  // Only block inactive and closed forms
  if (this.status === 'inactive' || this.status === 'closed') return false;
  if (this.softDelete) return false;
  
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  if (this.maxSubmissions && this.submissionCount >= this.maxSubmissions) return false;
  
  return true;
};

module.exports = mongoose.model('Form', formSchema);
