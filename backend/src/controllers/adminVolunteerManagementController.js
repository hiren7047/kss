const Member = require('../models/Member');
const VolunteerPoints = require('../models/VolunteerPoints');
const VolunteerWorkSubmission = require('../models/VolunteerWorkSubmission');
const Expense = require('../models/Expense');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const { generateRegistrationId } = require('../utils/volunteerCredentialsGenerator');
const { generatePassword } = require('../utils/passwordGenerator');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Get volunteer credentials (registration ID and password)
 * Note: Password is only returned once when volunteer is created
 */
const getVolunteerCredentials = async (req, res, next) => {
  try {
    const volunteer = await Member.findOne({
      _id: req.params.id,
      memberType: 'volunteer',
      softDelete: false
    }).select('+password'); // Include password field

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Return credentials
    res.status(200).json({
      success: true,
      data: {
        _id: volunteer._id,
        name: volunteer.name,
        memberId: volunteer.memberId,
        registrationId: volunteer.registrationId,
        password: volunteer.password ? '***' : null, // Don't return actual password for security
        hasPassword: !!volunteer.password
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset volunteer password (admin only)
 */
const resetVolunteerPassword = async (req, res, next) => {
  try {
    const volunteer = await Member.findOne({
      _id: req.params.id,
      memberType: 'volunteer',
      softDelete: false
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    const newPassword = generatePassword();
    volunteer.password = newPassword;
    await volunteer.save();

    const ipAddress = req.ip || req.connection.remoteAddress;
    await createAuditLog({
      userId: req.user._id,
      action: 'UPDATE',
      module: 'VOLUNTEER',
      newData: { 
        volunteerId: volunteer._id,
        registrationId: volunteer.registrationId,
        action: 'password_reset'
      },
      ipAddress,
      notes: 'Volunteer password reset by admin'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        registrationId: volunteer.registrationId,
        newPassword: newPassword // Return password only on reset
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get volunteer complete profile with points and stats
 */
const getVolunteerProfile = async (req, res, next) => {
  try {
    const volunteer = await Member.findOne({
      _id: req.params.id,
      memberType: 'volunteer',
      softDelete: false
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Get volunteer points
    const volunteerPoints = await VolunteerPoints.findOne({ volunteerId: volunteer._id });

    // Get work submissions count
    const workSubmissions = await VolunteerWorkSubmission.countDocuments({
      volunteerId: volunteer._id
    });

    // Get approved work count
    const approvedWork = await VolunteerWorkSubmission.countDocuments({
      volunteerId: volunteer._id,
      status: 'approved'
    });

    // Get total points earned
    const totalPointsEarned = await VolunteerWorkSubmission.aggregate([
      { $match: { volunteerId: volunteer._id, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$pointsAwarded' } } }
    ]);

    // Get expenses submitted
    const expensesSubmitted = await Expense.countDocuments({
      submittedBy: volunteer._id,
      softDelete: false
    });

    res.status(200).json({
      success: true,
      data: {
        volunteer: volunteer.toObject(),
        credentials: {
          registrationId: volunteer.registrationId,
          hasPassword: !!volunteer.password
        },
        points: volunteerPoints ? {
          total: volunteerPoints.points,
          verified: volunteerPoints.verifiedPoints,
          pending: volunteerPoints.pendingPoints,
          lastVerifiedAt: volunteerPoints.lastVerifiedAt
        } : {
          total: 0,
          verified: 0,
          pending: 0
        },
        stats: {
          workSubmissions,
          approvedWork,
          totalPointsEarned: totalPointsEarned[0]?.total || 0,
          expensesSubmitted
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all volunteer work submissions for admin review
 */
const getAllWorkSubmissions = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const filter = {};

    if (req.query.volunteerId) {
      filter.volunteerId = req.query.volunteerId;
    }
    if (req.query.eventId) {
      filter.eventId = req.query.eventId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
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

    res.status(200).json({
      success: true,
      data: createPaginationResponse(submissions, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all volunteer expenses for admin review
 */
const getVolunteerExpenses = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const filter = { softDelete: false };

    if (req.query.volunteerId) {
      filter.submittedBy = req.query.volunteerId;
    }
    if (req.query.approvalStatus) {
      filter.approvalStatus = req.query.approvalStatus;
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('submittedBy', 'name memberId registrationId')
        .populate('eventId', 'name')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: createPaginationResponse(expenses, total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVolunteerCredentials,
  resetVolunteerPassword,
  getVolunteerProfile,
  getAllWorkSubmissions,
  getVolunteerExpenses
};
