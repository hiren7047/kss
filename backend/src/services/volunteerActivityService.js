const VolunteerAssignment = require('../models/VolunteerAssignment');
const VolunteerWorkSubmission = require('../models/VolunteerWorkSubmission');
const Event = require('../models/Event');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

/**
 * Get volunteer's activities (events they've attended/participated in)
 */
const getVolunteerActivities = async (volunteerId, query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { volunteerId, softDelete: false };

  // Apply filters
  if (query.attendance) {
    filter.attendance = query.attendance;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }

  const [assignments, total] = await Promise.all([
    VolunteerAssignment.find(filter)
      .populate('eventId', 'name description location startDate endDate status mainsiteDisplay')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    VolunteerAssignment.countDocuments(filter)
  ]);

  // Get work submissions for these events
  const eventIds = assignments.map(a => a.eventId?._id).filter(Boolean);
  const workSubmissions = await VolunteerWorkSubmission.find({
    volunteerId,
    eventId: { $in: eventIds }
  }).select('eventId workTitle pointsAwarded status createdAt');

  // Map work submissions to events
  const workMap = new Map();
  workSubmissions.forEach(ws => {
    const eventId = ws.eventId.toString();
    if (!workMap.has(eventId)) {
      workMap.set(eventId, []);
    }
    workMap.get(eventId).push({
      workTitle: ws.workTitle,
      pointsAwarded: ws.pointsAwarded,
      status: ws.status,
      submittedAt: ws.createdAt
    });
  });

  // Combine assignments with work submissions
  const activities = assignments.map(assignment => {
    const event = assignment.eventId;
    const work = workMap.get(event?._id?.toString()) || [];
    
    return {
      assignment: {
        _id: assignment._id,
        role: assignment.role,
        attendance: assignment.attendance,
        remarks: assignment.remarks,
        assignedAt: assignment.createdAt
      },
      event: event ? {
        _id: event._id,
        name: event.name,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        isPublic: event.mainsiteDisplay?.isPublic || false
      } : null,
      workSubmissions: work
    };
  });

  return createPaginationResponse(activities, total, page, limit);
};

/**
 * Get volunteer's activity summary
 */
const getVolunteerActivitySummary = async (volunteerId) => {
  const [totalEvents, presentEvents, pendingEvents, workSubmissions] = await Promise.all([
    VolunteerAssignment.countDocuments({ volunteerId, softDelete: false }),
    VolunteerAssignment.countDocuments({ volunteerId, attendance: 'present', softDelete: false }),
    VolunteerAssignment.countDocuments({ volunteerId, attendance: 'pending', softDelete: false }),
    VolunteerWorkSubmission.countDocuments({ volunteerId })
  ]);

  const approvedWork = await VolunteerWorkSubmission.countDocuments({
    volunteerId,
    status: 'approved'
  });

  const totalPointsEarned = await VolunteerWorkSubmission.aggregate([
    { $match: { volunteerId: volunteerId, status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$pointsAwarded' } } }
  ]);

  return {
    totalEvents,
    presentEvents,
    pendingEvents,
    absentEvents: totalEvents - presentEvents - pendingEvents,
    workSubmissions,
    approvedWork,
    totalPointsEarned: totalPointsEarned[0]?.total || 0
  };
};

module.exports = {
  getVolunteerActivities,
  getVolunteerActivitySummary
};
