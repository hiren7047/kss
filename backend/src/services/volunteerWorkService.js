const VolunteerWorkSubmission = require('../models/VolunteerWorkSubmission');
const VolunteerPoints = require('../models/VolunteerPoints');
const Member = require('../models/Member');
const Event = require('../models/Event');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

/**
 * Submit work by volunteer
 */
const submitWork = async (workData, volunteerId, ipAddress) => {
  // Verify volunteer exists
  const volunteer = await Member.findOne({
    _id: volunteerId,
    memberType: 'volunteer',
    softDelete: false
  });

  if (!volunteer) {
    throw new Error('Volunteer not found');
  }

  // Verify event exists
  const event = await Event.findOne({
    _id: workData.eventId,
    softDelete: false
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Create work submission
  const submission = await VolunteerWorkSubmission.create({
    ...workData,
    volunteerId,
    status: 'submitted'
  });

  // Create audit log
  await createAuditLog({
    userId: null,
    action: 'CREATE',
    module: 'VOLUNTEER_WORK',
    newData: submission.toObject(),
    ipAddress,
    notes: `Work submitted by volunteer ${volunteer.registrationId}`
  });

  // Create notification for admins
  try {
    const { notifyVolunteerWorkSubmitted } = require('../utils/notificationHelper');
    await notifyVolunteerWorkSubmitted(submission);
  } catch (error) {
    console.error('Error creating volunteer work notification:', error);
    // Don't fail submission if notification fails
  }

  return submission;
};

/**
 * Get all work submissions (for admin/volunteer)
 */
const getWorkSubmissions = async (query, volunteerId = null) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  // If volunteerId provided, filter by volunteer
  if (volunteerId) {
    filter.volunteerId = volunteerId;
  }

  // Apply filters
  if (query.eventId) {
    filter.eventId = query.eventId;
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.workType) {
    filter.workType = query.workType;
  }

  const [submissions, total] = await Promise.all([
    VolunteerWorkSubmission.find(filter)
      .populate('volunteerId', 'name memberId registrationId photo')
      .populate('eventId', 'name startDate endDate location')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    VolunteerWorkSubmission.countDocuments(filter)
  ]);

  return createPaginationResponse(submissions, total, page, limit);
};

/**
 * Get work submission by ID
 */
const getWorkSubmissionById = async (id, volunteerId = null) => {
  const filter = { _id: id };
  if (volunteerId) {
    filter.volunteerId = volunteerId;
  }

  const submission = await VolunteerWorkSubmission.findOne(filter)
    .populate('volunteerId', 'name memberId registrationId photo')
    .populate('eventId', 'name startDate endDate location')
    .populate('reviewedBy', 'name email');

  if (!submission) {
    throw new Error('Work submission not found');
  }

  return submission;
};

/**
 * Review and approve/reject work submission (admin only)
 */
const reviewWorkSubmission = async (id, reviewData, userId, ipAddress) => {
  const submission = await VolunteerWorkSubmission.findOne({ _id: id });
  if (!submission) {
    throw new Error('Work submission not found');
  }

  if (submission.status !== 'submitted' && submission.status !== 'under_review') {
    throw new Error('Work submission has already been reviewed');
  }

  const oldData = submission.toObject();

  submission.status = reviewData.status;
  submission.reviewedBy = userId;
  submission.reviewedAt = new Date();
  submission.reviewNotes = reviewData.reviewNotes || null;
  submission.rejectionReason = reviewData.rejectionReason || null;

  // If approved, award points and update volunteer points
  if (reviewData.status === 'approved' && reviewData.pointsAwarded) {
    submission.pointsAwarded = reviewData.pointsAwarded;

    // Update volunteer points
    let volunteerPoints = await VolunteerPoints.findOne({ volunteerId: submission.volunteerId });
    if (!volunteerPoints) {
      volunteerPoints = await VolunteerPoints.create({
        volunteerId: submission.volunteerId,
        points: 0,
        verifiedPoints: 0,
        pendingPoints: 0
      });
    }

    // Add to pending points (admin needs to verify)
    volunteerPoints.pendingPoints += reviewData.pointsAwarded;
    volunteerPoints.points += reviewData.pointsAwarded;
    await volunteerPoints.save();
  }

  await submission.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: reviewData.status === 'approved' ? 'APPROVE' : 'REJECT',
    module: 'VOLUNTEER_WORK',
    oldData,
    newData: submission.toObject(),
    ipAddress
  });

  return submission;
};

/**
 * Verify points (admin only - moves pending points to verified)
 */
const verifyPoints = async (volunteerId, pointsToVerify, userId, ipAddress) => {
  const volunteerPoints = await VolunteerPoints.findOne({ volunteerId });
  if (!volunteerPoints) {
    throw new Error('Volunteer points record not found');
  }

  if (pointsToVerify > volunteerPoints.pendingPoints) {
    throw new Error('Cannot verify more points than pending');
  }

  const oldData = volunteerPoints.toObject();

  volunteerPoints.verifiedPoints += pointsToVerify;
  volunteerPoints.pendingPoints -= pointsToVerify;
  volunteerPoints.lastVerifiedBy = userId;
  volunteerPoints.lastVerifiedAt = new Date();

  await volunteerPoints.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'VERIFY',
    module: 'VOLUNTEER_POINTS',
    oldData,
    newData: volunteerPoints.toObject(),
    ipAddress,
    notes: `Verified ${pointsToVerify} points for volunteer`
  });

  return volunteerPoints;
};

module.exports = {
  submitWork,
  getWorkSubmissions,
  getWorkSubmissionById,
  reviewWorkSubmission,
  verifyPoints
};
