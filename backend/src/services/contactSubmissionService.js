const ContactSubmission = require('../models/ContactSubmission');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

const createContactSubmission = async (submissionData) => {
  return await ContactSubmission.create(submissionData);
};

const getContactSubmissions = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  if (query.status) {
    filter.status = query.status;
  }

  const [submissions, total] = await Promise.all([
    ContactSubmission.find(filter)
      .populate('repliedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ContactSubmission.countDocuments(filter)
  ]);

  return createPaginationResponse(submissions, total, page, limit);
};

const getContactSubmission = async (id) => {
  const submission = await ContactSubmission.findOne({
    _id: id,
    softDelete: false
  }).populate('repliedBy', 'name email');

  if (!submission) {
    throw new Error('Contact submission not found');
  }

  return submission;
};

const updateContactSubmissionStatus = async (id, status, userId, ipAddress) => {
  const submission = await ContactSubmission.findOne({
    _id: id,
    softDelete: false
  });

  if (!submission) {
    throw new Error('Contact submission not found');
  }

  const oldData = submission.toObject();
  submission.status = status;
  await submission.save();

  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'CONTACT_SUBMISSION',
    oldData,
    newData: submission.toObject(),
    ipAddress
  });

  return submission;
};

const replyToSubmission = async (id, replyMessage, userId, ipAddress) => {
  const submission = await ContactSubmission.findOne({
    _id: id,
    softDelete: false
  });

  if (!submission) {
    throw new Error('Contact submission not found');
  }

  const oldData = submission.toObject();
  submission.status = 'replied';
  submission.repliedBy = userId;
  submission.repliedAt = new Date();
  submission.replyMessage = replyMessage;
  await submission.save();

  await createAuditLog({
    userId,
    action: 'REPLY',
    module: 'CONTACT_SUBMISSION',
    oldData,
    newData: submission.toObject(),
    ipAddress
  });

  return submission;
};

const deleteContactSubmission = async (id, userId, ipAddress) => {
  const submission = await ContactSubmission.findOne({
    _id: id,
    softDelete: false
  });

  if (!submission) {
    throw new Error('Contact submission not found');
  }

  const oldData = submission.toObject();
  submission.softDelete = true;
  await submission.save();

  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'CONTACT_SUBMISSION',
    oldData,
    ipAddress
  });

  return submission;
};

module.exports = {
  createContactSubmission,
  getContactSubmissions,
  getContactSubmission,
  updateContactSubmissionStatus,
  replyToSubmission,
  deleteContactSubmission
};
