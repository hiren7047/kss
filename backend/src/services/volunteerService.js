const VolunteerAssignment = require('../models/VolunteerAssignment');
const Member = require('../models/Member');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Assign volunteer to event
 */
const assignVolunteer = async (assignmentData, userId, ipAddress) => {
  // Check if volunteer is already assigned
  const existing = await VolunteerAssignment.findOne({
    volunteerId: assignmentData.volunteerId,
    eventId: assignmentData.eventId
  });

  if (existing) {
    throw new Error('Volunteer is already assigned to this event');
  }

  // Verify volunteer exists and is of type volunteer
  const volunteer = await Member.findOne({
    _id: assignmentData.volunteerId,
    memberType: 'volunteer',
    softDelete: false
  });

  if (!volunteer) {
    throw new Error('Volunteer not found or invalid member type');
  }

  const assignment = await VolunteerAssignment.create(assignmentData);

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'VOLUNTEER',
    newData: assignment.toObject(),
    ipAddress
  });

  return assignment;
};

/**
 * Get all volunteer assignments with filters
 */
const getAllAssignments = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    volunteerId,
    eventId,
    attendance,
    search
  } = filters;

  const query = {};
  
  if (volunteerId) {
    query.volunteerId = volunteerId;
  }
  
  if (eventId) {
    query.eventId = eventId;
  }
  
  if (attendance) {
    query.attendance = attendance;
  }

  const skip = (page - 1) * limit;

  let assignmentsQuery = VolunteerAssignment.find(query)
    .populate('volunteerId', 'name memberId email mobile photo')
    .populate('eventId', 'name startDate endDate location status')
    .sort({ createdAt: -1 });

  // If search is provided, filter by volunteer name or event name
  if (search) {
    assignmentsQuery = VolunteerAssignment.find(query)
      .populate({
        path: 'volunteerId',
        match: { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { memberId: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        },
        select: 'name memberId email mobile photo'
      })
      .populate({
        path: 'eventId',
        match: { name: { $regex: search, $options: 'i' } },
        select: 'name startDate endDate location status'
      })
      .sort({ createdAt: -1 });
  }

  const assignments = await assignmentsQuery.skip(skip).limit(limit * 2); // Get more to account for filtering
  
  // Filter out assignments where populated fields are null (due to search match)
  const filteredAssignments = assignments.filter(
    assignment => assignment.volunteerId && assignment.eventId
  ).slice(0, limit); // Take only the requested limit

  // For accurate count with search, we need to count after filtering
  // This is a limitation, but we'll use an approximation
  let total;
  if (search) {
    // When searching, get a larger sample to estimate total
    const allMatching = await VolunteerAssignment.find(query)
      .populate({
        path: 'volunteerId',
        match: { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { memberId: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        },
        select: 'name memberId email mobile photo'
      })
      .populate({
        path: 'eventId',
        match: { name: { $regex: search, $options: 'i' } },
        select: 'name startDate endDate location status'
      });
    total = allMatching.filter(a => a.volunteerId && a.eventId).length;
  } else {
    total = await VolunteerAssignment.countDocuments(query);
  }

  return {
    data: filteredAssignments,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get volunteers for an event
 */
const getVolunteersByEvent = async (eventId) => {
  const assignments = await VolunteerAssignment.find({ eventId })
    .populate('volunteerId', 'name memberId email mobile photo')
    .sort({ createdAt: -1 });

  return assignments;
};

/**
 * Update volunteer attendance
 */
const updateAttendance = async (assignmentId, attendanceData, userId, ipAddress) => {
  const assignment = await VolunteerAssignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const oldData = assignment.toObject();
  assignment.attendance = attendanceData.attendance;
  if (attendanceData.remarks) {
    assignment.remarks = attendanceData.remarks;
  }
  await assignment.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'VOLUNTEER',
    oldData,
    newData: assignment.toObject(),
    ipAddress
  });

  return assignment;
};

/**
 * Remove volunteer from event
 */
const removeVolunteer = async (assignmentId, userId, ipAddress) => {
  const assignment = await VolunteerAssignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const oldData = assignment.toObject();
  await VolunteerAssignment.findByIdAndDelete(assignmentId);

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'VOLUNTEER',
    oldData,
    ipAddress
  });

  return { message: 'Volunteer removed from event' };
};

/**
 * Get assignments by volunteer
 */
const getAssignmentsByVolunteer = async (volunteerId) => {
  const assignments = await VolunteerAssignment.find({ volunteerId })
    .populate('eventId', 'name startDate endDate location status')
    .sort({ createdAt: -1 });

  return assignments;
};

module.exports = {
  assignVolunteer,
  getAllAssignments,
  getVolunteersByEvent,
  getAssignmentsByVolunteer,
  updateAttendance,
  removeVolunteer
};


