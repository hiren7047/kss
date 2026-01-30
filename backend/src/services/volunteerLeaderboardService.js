const VolunteerPoints = require('../models/VolunteerPoints');
const Member = require('../models/Member');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

/**
 * Get leaderboard (ranked by points)
 */
const getLeaderboard = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  
  // Determine sort field
  const sortField = query.sortBy === 'verified' ? 'verifiedPoints' : 'points';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  // Get volunteer points with pagination
  const [pointsList, total] = await Promise.all([
    VolunteerPoints.find({})
      .populate('volunteerId', 'name memberId registrationId photo email mobile')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    VolunteerPoints.countDocuments({})
  ]);

  // Calculate ranks
  const allPoints = await VolunteerPoints.find({})
    .sort({ [sortField]: sortOrder })
    .select('volunteerId ' + sortField);

  const rankMap = new Map();
  allPoints.forEach((vp, index) => {
    rankMap.set(vp.volunteerId.toString(), index + 1);
  });

  // Add rank to each entry
  const leaderboard = pointsList.map(vp => {
    const volunteer = vp.volunteerId;
    return {
      rank: rankMap.get(volunteer._id.toString()),
      volunteer: {
        _id: volunteer._id,
        name: volunteer.name,
        memberId: volunteer.memberId,
        registrationId: volunteer.registrationId,
        photo: volunteer.photo
      },
      points: vp.points,
      verifiedPoints: vp.verifiedPoints,
      pendingPoints: vp.pendingPoints,
      lastVerifiedAt: vp.lastVerifiedAt
    };
  });

  return createPaginationResponse(leaderboard, total, page, limit);
};

/**
 * Get volunteer's rank and stats
 */
const getVolunteerStats = async (volunteerId) => {
  const volunteerPoints = await VolunteerPoints.findOne({ volunteerId })
    .populate('volunteerId', 'name memberId registrationId photo');

  if (!volunteerPoints) {
    // Return default stats if no points record
    const volunteer = await Member.findById(volunteerId);
    return {
      rank: null,
      volunteer: volunteer ? {
        _id: volunteer._id,
        name: volunteer.name,
        memberId: volunteer.memberId,
        registrationId: volunteer.registrationId,
        photo: volunteer.photo
      } : null,
      points: 0,
      verifiedPoints: 0,
      pendingPoints: 0
    };
  }

  // Calculate rank
  const sortField = 'points'; // Default to total points
  const allPoints = await VolunteerPoints.find({})
    .sort({ [sortField]: -1 })
    .select('volunteerId ' + sortField);

  let rank = null;
  for (let i = 0; i < allPoints.length; i++) {
    if (allPoints[i].volunteerId.toString() === volunteerId.toString()) {
      rank = i + 1;
      break;
    }
  }

  return {
    rank,
    volunteer: {
      _id: volunteerPoints.volunteerId._id,
      name: volunteerPoints.volunteerId.name,
      memberId: volunteerPoints.volunteerId.memberId,
      registrationId: volunteerPoints.volunteerId.registrationId,
      photo: volunteerPoints.volunteerId.photo
    },
    points: volunteerPoints.points,
    verifiedPoints: volunteerPoints.verifiedPoints,
    pendingPoints: volunteerPoints.pendingPoints,
    lastVerifiedAt: volunteerPoints.lastVerifiedAt
  };
};

/**
 * Get top N volunteers
 */
const getTopVolunteers = async (limit = 10) => {
  const topVolunteers = await VolunteerPoints.find({})
    .populate('volunteerId', 'name memberId registrationId photo')
    .sort({ points: -1 })
    .limit(limit);

  return topVolunteers.map((vp, index) => ({
    rank: index + 1,
    volunteer: {
      _id: vp.volunteerId._id,
      name: vp.volunteerId.name,
      memberId: vp.volunteerId.memberId,
      registrationId: vp.volunteerId.registrationId,
      photo: vp.volunteerId.photo
    },
    points: vp.points,
    verifiedPoints: vp.verifiedPoints
  }));
};

module.exports = {
  getLeaderboard,
  getVolunteerStats,
  getTopVolunteers
};
