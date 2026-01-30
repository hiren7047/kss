const Form = require('../models/Form');
const FormSubmission = require('../models/FormSubmission');
const Event = require('../models/Event');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const path = require('path');
const fs = require('fs').promises;

/**
 * Create a new form
 */
const createForm = async (formData, userId, ipAddress) => {
  // Validate eventId if provided
  if (formData.eventId) {
    const event = await Event.findOne({ _id: formData.eventId, softDelete: false });
    if (!event) {
      throw new Error('Event not found');
    }
  }

  const form = await Form.create({
    ...formData,
    createdBy: userId
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'FORM',
    newData: form.toObject(),
    ipAddress
  });

  return form;
};

/**
 * Get all forms with pagination and filters
 */
const getForms = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  // Apply filters
  if (query.status) {
    filter.status = query.status;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }
  if (query.createdBy) {
    filter.createdBy = query.createdBy;
  }
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }

  const [forms, total] = await Promise.all([
    Form.find(filter)
      .populate('eventId', 'name startDate endDate')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Form.countDocuments(filter)
  ]);

  return createPaginationResponse(forms, total, page, limit);
};

/**
 * Get form by ID
 */
const getFormById = async (id) => {
  const form = await Form.findOne({ _id: id, softDelete: false })
    .populate('eventId', 'name startDate endDate')
    .populate('createdBy', 'name email');
  
  if (!form) {
    throw new Error('Form not found');
  }
  return form;
};

/**
 * Get form by shareable token (for public access)
 * Allows viewing any non-deleted form, but submission will be checked separately
 */
const getFormByToken = async (token) => {
  const form = await Form.findOne({ 
    shareableToken: token, 
    softDelete: false 
  })
    .populate('eventId', 'name startDate endDate');
  
  if (!form) {
    throw new Error('Form not found');
  }

  // Return form even if not accepting submissions
  // Frontend will handle showing appropriate message
  return form;
};

/**
 * Get form by slug (for public access)
 * Allows viewing any non-deleted form, but submission will be checked separately
 */
const getFormBySlug = async (slug) => {
  const form = await Form.findOne({ 
    slug: slug, 
    softDelete: false 
  })
    .populate('eventId', 'name startDate endDate');
  
  if (!form) {
    throw new Error('Form not found');
  }

  // Return form even if not accepting submissions
  // Frontend will handle showing appropriate message
  return form;
};

/**
 * Update form
 */
const updateForm = async (id, updateData, userId, ipAddress) => {
  const form = await Form.findOne({ _id: id, softDelete: false });
  if (!form) {
    throw new Error('Form not found');
  }

  // Validate eventId if provided
  if (updateData.eventId) {
    const event = await Event.findOne({ _id: updateData.eventId, softDelete: false });
    if (!event) {
      throw new Error('Event not found');
    }
  }

  // Handle slug uniqueness
  if (updateData.slug && updateData.slug !== form.slug) {
    const existingForm = await Form.findOne({ 
      slug: updateData.slug,
      _id: { $ne: id },
      softDelete: false
    });
    if (existingForm) {
      throw new Error('Slug already exists');
    }
  }

  const oldData = form.toObject();
  Object.assign(form, updateData);
  await form.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'FORM',
    oldData,
    newData: form.toObject(),
    ipAddress
  });

  return form;
};

/**
 * Submit form (public endpoint)
 */
const submitForm = async (formId, submissionData, fileUploads, submitterInfo) => {
  const form = await Form.findOne({ _id: formId, softDelete: false });
  if (!form) {
    throw new Error('Form not found');
  }

  // Check if form is accepting submissions
  if (!form.isAcceptingSubmissions()) {
    throw new Error('Form is not currently accepting submissions');
  }

  // Validate responses against form fields
  const fieldMap = new Map();
  form.fields.forEach(field => {
    fieldMap.set(field.fieldId, field);
  });

  // Convert responses to Map if it's an object
  const responsesMap = submissionData.responses instanceof Map 
    ? submissionData.responses 
    : new Map(Object.entries(submissionData.responses || {}));

  // Validate all required fields are present
  for (const field of form.fields) {
    if (field.required && !responsesMap.has(field.fieldId)) {
      throw new Error(`Required field '${field.label}' is missing`);
    }
  }

  // Validate field types and values
  for (const [fieldId, value] of responsesMap.entries()) {
    const field = fieldMap.get(fieldId);
    if (!field) {
      throw new Error(`Unknown field: ${fieldId}`);
    }

    // Type validation
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error(`Invalid email format for field '${field.label}'`);
    }
    if (field.type === 'number' && value !== null && value !== undefined && isNaN(value)) {
      throw new Error(`Invalid number for field '${field.label}'`);
    }
    if (field.type === 'date' && value && isNaN(Date.parse(value))) {
      throw new Error(`Invalid date for field '${field.label}'`);
    }

    // Validation rules
    if (field.validation) {
      if (field.validation.minLength && String(value).length < field.validation.minLength) {
        throw new Error(field.validation.customMessage || `Field '${field.label}' is too short`);
      }
      if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
        throw new Error(field.validation.customMessage || `Field '${field.label}' is too long`);
      }
      if (field.validation.min !== undefined && Number(value) < field.validation.min) {
        throw new Error(field.validation.customMessage || `Field '${field.label}' value is too small`);
      }
      if (field.validation.max !== undefined && Number(value) > field.validation.max) {
        throw new Error(field.validation.customMessage || `Field '${field.label}' value is too large`);
      }
    }

    // Options validation for select/radio/checkbox
    if (['select', 'radio', 'checkbox'].includes(field.type) && field.options) {
      const validValues = field.options.map(opt => opt.value);
      if (Array.isArray(value)) {
        const invalidValues = value.filter(v => !validValues.includes(v));
        if (invalidValues.length > 0) {
          throw new Error(`Invalid option values for field '${field.label}'`);
        }
      } else if (!validValues.includes(value)) {
        throw new Error(`Invalid option value for field '${field.label}'`);
      }
    }
  }

  // Create submission
  const submission = await FormSubmission.create({
    formId: form._id,
    responses: responsesMap,
    fileUploads: fileUploads || [],
    submitterInfo: submitterInfo || {},
    status: 'submitted'
  });

  // Update form submission count
  form.submissionCount += 1;
  await form.save();

  // Create notification for admins
  try {
    const { notifyFormSubmission } = require('../utils/notificationHelper');
    await notifyFormSubmission(submission, form);
  } catch (error) {
    console.error('Error creating form submission notification:', error);
    // Don't fail submission if notification fails
  }

  return submission;
};

/**
 * Get form submissions
 */
const getFormSubmissions = async (formId, query) => {
  const form = await Form.findOne({ _id: formId, softDelete: false });
  if (!form) {
    throw new Error('Form not found');
  }

  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { formId, softDelete: false };

  if (query.status) {
    filter.status = query.status;
  }

  const [submissions, total] = await Promise.all([
    FormSubmission.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    FormSubmission.countDocuments(filter)
  ]);

  return createPaginationResponse(submissions, total, page, limit);
};

/**
 * Get submission by ID
 */
const getSubmissionById = async (submissionId) => {
  const submission = await FormSubmission.findOne({ 
    _id: submissionId, 
    softDelete: false 
  })
    .populate('formId', 'title fields')
    .populate('reviewedBy', 'name email');
  
  if (!submission) {
    throw new Error('Submission not found');
  }
  return submission;
};

/**
 * Update submission status
 */
const updateSubmission = async (submissionId, updateData, userId, ipAddress) => {
  const submission = await FormSubmission.findOne({ 
    _id: submissionId, 
    softDelete: false 
  });
  
  if (!submission) {
    throw new Error('Submission not found');
  }

  const oldData = submission.toObject();
  
  if (updateData.status === 'reviewed' && !submission.reviewedBy) {
    submission.reviewedBy = userId;
    submission.reviewedAt = new Date();
  }
  
  Object.assign(submission, updateData);
  await submission.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'FORM_SUBMISSION',
    oldData,
    newData: submission.toObject(),
    ipAddress
  });

  return submission;
};

/**
 * Get form analytics
 */
const getFormAnalytics = async (formId) => {
  const form = await Form.findOne({ _id: formId, softDelete: false })
    .populate('eventId', 'name')
    .populate('createdBy', 'name email');
  
  if (!form) {
    throw new Error('Form not found');
  }

  // Get submission statistics
  const totalSubmissions = await FormSubmission.countDocuments({ 
    formId, 
    softDelete: false 
  });
  
  const submissionsByStatus = await FormSubmission.aggregate([
    { $match: { formId: form._id, softDelete: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const statusMap = {};
  submissionsByStatus.forEach(item => {
    statusMap[item._id] = item.count;
  });

  // Get submissions by date (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const submissionsByDate = await FormSubmission.aggregate([
    {
      $match: {
        formId: form._id,
        softDelete: false,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    form: {
      id: form._id,
      title: form.title,
      status: form.status,
      eventId: form.eventId,
      createdBy: form.createdBy
    },
    statistics: {
      totalSubmissions,
      submissionCount: form.submissionCount,
      maxSubmissions: form.maxSubmissions,
      remainingSubmissions: form.maxSubmissions 
        ? Math.max(0, form.maxSubmissions - form.submissionCount) 
        : null,
      submissionsByStatus: {
        submitted: statusMap.submitted || 0,
        reviewed: statusMap.reviewed || 0,
        archived: statusMap.archived || 0
      }
    },
    trends: {
      submissionsByDate
    },
    formSettings: {
      allowMultipleSubmissions: form.allowMultipleSubmissions,
      startDate: form.startDate,
      endDate: form.endDate,
      isAcceptingSubmissions: form.isAcceptingSubmissions()
    }
  };
};

/**
 * Soft delete form
 */
const deleteForm = async (id, userId, ipAddress) => {
  const form = await Form.findOne({ _id: id, softDelete: false });
  if (!form) {
    throw new Error('Form not found');
  }

  const oldData = form.toObject();
  form.softDelete = true;
  await form.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'FORM',
    oldData,
    newData: form.toObject(),
    ipAddress
  });

  return form;
};

/**
 * Soft delete submission
 */
const deleteSubmission = async (submissionId, userId, ipAddress) => {
  const submission = await FormSubmission.findOne({ 
    _id: submissionId, 
    softDelete: false 
  });
  
  if (!submission) {
    throw new Error('Submission not found');
  }

  const oldData = submission.toObject();
  submission.softDelete = true;
  await submission.save();

  // Decrease form submission count
  const form = await Form.findById(submission.formId);
  if (form) {
    form.submissionCount = Math.max(0, form.submissionCount - 1);
    await form.save();
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'FORM_SUBMISSION',
    oldData,
    newData: submission.toObject(),
    ipAddress
  });

  return submission;
};

module.exports = {
  createForm,
  getForms,
  getFormById,
  getFormByToken,
  getFormBySlug,
  updateForm,
  submitForm,
  getFormSubmissions,
  getSubmissionById,
  updateSubmission,
  getFormAnalytics,
  deleteForm,
  deleteSubmission
};
