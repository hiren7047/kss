const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const { jwtSecret } = require('../config/env');

/**
 * Verify JWT token for volunteer and attach volunteer to request
 */
const authenticateVolunteer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a token.'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    
    // Check if token is for volunteer
    if (decoded.type !== 'volunteer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const volunteer = await Member.findById(decoded.volunteerId)
      .select('-password');

    if (!volunteer) {
      return res.status(401).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    if (volunteer.memberType !== 'volunteer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid account type'
      });
    }

    if (volunteer.softDelete || volunteer.status !== 'active' || volunteer.approvalStatus !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or not approved'
      });
    }

    req.volunteer = volunteer;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = {
  authenticateVolunteer
};
