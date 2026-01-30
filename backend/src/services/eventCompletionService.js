const Event = require('../models/Event');
const VolunteerAssignment = require('../models/VolunteerAssignment');
const VolunteerPoints = require('../models/VolunteerPoints');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Complete event and assign points to volunteers based on attendance
 */
const completeEventWithPoints = async (eventId, pointsData, userId, ipAddress) => {
  const event = await Event.findOne({ _id: eventId, softDelete: false });
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.status === 'completed') {
    throw new Error('Event is already completed');
  }

  // Get all volunteer assignments for this event
  const assignments = await VolunteerAssignment.find({ eventId });

  if (assignments.length === 0) {
    throw new Error('No volunteers assigned to this event');
  }

  const oldData = event.toObject();

  // Update event status
  event.status = 'completed';
  await event.save();

  // Process points for each volunteer
  const pointsResults = [];
  const pointsMap = new Map();

  // Create points map from pointsData
  if (pointsData.volunteerPoints && Array.isArray(pointsData.volunteerPoints)) {
    pointsData.volunteerPoints.forEach(vp => {
      if (vp.volunteerId && vp.points) {
        pointsMap.set(vp.volunteerId.toString(), {
          points: vp.points,
          notes: vp.notes || null
        });
      }
    });
  }

  // Assign points based on attendance or provided points
  for (const assignment of assignments) {
    const volunteerId = assignment.volunteerId._id || assignment.volunteerId;
    
    let pointsToAward = 0;
    let pointsNotes = null;

    // If specific points provided for this volunteer, use them
    if (pointsMap.has(volunteerId.toString())) {
      const vpData = pointsMap.get(volunteerId.toString());
      pointsToAward = vpData.points;
      pointsNotes = vpData.notes;
    } else {
      // Otherwise, use default points based on attendance
      if (assignment.attendance === 'present') {
        pointsToAward = pointsData.defaultPointsForPresent || 10;
      } else if (assignment.attendance === 'absent') {
        pointsToAward = pointsData.defaultPointsForAbsent || 0;
      } else {
        pointsToAward = pointsData.defaultPointsForPending || 5;
      }
    }

    // Only award points if > 0
    if (pointsToAward > 0) {
      // Get or create volunteer points record
      let volunteerPoints = await VolunteerPoints.findOne({ volunteerId });
      if (!volunteerPoints) {
        volunteerPoints = await VolunteerPoints.create({
          volunteerId,
          points: 0,
          verifiedPoints: 0,
          pendingPoints: 0
        });
      }

      // Add points (as pending - admin needs to verify)
      volunteerPoints.pendingPoints += pointsToAward;
      volunteerPoints.points += pointsToAward;
      if (pointsNotes) {
        volunteerPoints.notes = (volunteerPoints.notes || '') + `\nEvent: ${event.name} - ${pointsNotes}`;
      }
      await volunteerPoints.save();

      pointsResults.push({
        volunteerId,
        volunteerName: assignment.volunteerId.name || 'Unknown',
        pointsAwarded: pointsToAward,
        attendance: assignment.attendance
      });
    }
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: 'COMPLETE',
    module: 'EVENT',
    oldData,
    newData: event.toObject(),
    ipAddress,
    notes: `Event completed. Points assigned to ${pointsResults.length} volunteers.`
  });

  return {
    event,
    pointsAssigned: pointsResults,
    totalVolunteers: assignments.length,
    totalPointsAwarded: pointsResults.reduce((sum, p) => sum + p.pointsAwarded, 0)
  };
};

/**
 * Get event completion summary with volunteer attendance
 */
const getEventCompletionSummary = async (eventId) => {
  const event = await Event.findOne({ _id: eventId, softDelete: false });
  if (!event) {
    throw new Error('Event not found');
  }

  // Get all volunteer assignments
  const assignments = await VolunteerAssignment.find({ eventId })
    .populate('volunteerId', 'name memberId registrationId photo');

  // Get volunteer points for reference
  const volunteerIds = assignments.map(a => a.volunteerId._id || a.volunteerId);
  const volunteerPoints = await VolunteerPoints.find({
    volunteerId: { $in: volunteerIds }
  });

  const pointsMap = new Map();
  volunteerPoints.forEach(vp => {
    pointsMap.set(vp.volunteerId.toString(), {
      total: vp.points,
      verified: vp.verifiedPoints,
      pending: vp.pendingPoints
    });
  });

  const volunteers = assignments.map(assignment => {
    const volunteer = assignment.volunteerId;
    const vp = pointsMap.get(volunteer._id.toString());
    
    return {
      _id: volunteer._id,
      name: volunteer.name,
      memberId: volunteer.memberId,
      registrationId: volunteer.registrationId,
      photo: volunteer.photo,
      attendance: assignment.attendance,
      role: assignment.role,
      currentPoints: vp ? vp.total : 0,
      verifiedPoints: vp ? vp.verified : 0,
      pendingPoints: vp ? vp.pending : 0
    };
  });

  return {
    event: {
      _id: event._id,
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status
    },
    volunteers,
    summary: {
      totalVolunteers: volunteers.length,
      present: volunteers.filter(v => v.attendance === 'present').length,
      absent: volunteers.filter(v => v.attendance === 'absent').length,
      pending: volunteers.filter(v => v.attendance === 'pending').length
    }
  };
};

module.exports = {
  completeEventWithPoints,
  getEventCompletionSummary
};
