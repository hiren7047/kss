const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const { jwtSecret, jwtExpiresIn, jwtRefreshExpiresIn } = require('../config/env');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Generate JWT tokens for volunteer
 */
const generateTokens = (volunteerId) => {
  const accessToken = jwt.sign({ volunteerId, type: 'volunteer' }, jwtSecret, { expiresIn: jwtExpiresIn });
  const refreshToken = jwt.sign({ volunteerId, type: 'volunteer' }, jwtSecret, { expiresIn: jwtRefreshExpiresIn });
  return { accessToken, refreshToken };
};

/**
 * Volunteer login service
 */
const login = async (registrationId, password, ipAddress) => {
  // Find volunteer by registration ID
  const volunteer = await Member.findOne({ 
    registrationId, 
    memberType: 'volunteer',
    softDelete: false 
  }).select('+password'); // Include password field

  if (!volunteer) {
    throw new Error('Invalid registration ID or password');
  }

  // Check if volunteer is approved and active
  if (volunteer.approvalStatus !== 'approved' || volunteer.status !== 'active') {
    throw new Error('Your account is pending approval or inactive. Please contact admin.');
  }

  // Check password
  const isPasswordValid = await volunteer.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid registration ID or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(volunteer._id);

  // Create audit log
  await createAuditLog({
    userId: null,
    action: 'LOGIN',
    module: 'VOLUNTEER_AUTH',
    newData: { 
      volunteerId: volunteer._id,
      registrationId: volunteer.registrationId,
      loginTime: new Date() 
    },
    ipAddress,
    notes: 'Volunteer login'
  });

  return {
    volunteer: {
      _id: volunteer._id,
      name: volunteer.name,
      memberId: volunteer.memberId,
      registrationId: volunteer.registrationId,
      email: volunteer.email,
      mobile: volunteer.mobile,
      photo: volunteer.photo
    },
    accessToken,
    refreshToken
  };
};

/**
 * Get volunteer profile
 */
const getProfile = async (volunteerId) => {
  const volunteer = await Member.findOne({ 
    _id: volunteerId,
    memberType: 'volunteer',
    softDelete: false 
  });

  if (!volunteer) {
    throw new Error('Volunteer not found');
  }

  return volunteer;
};

/**
 * Change password
 */
const changePassword = async (volunteerId, oldPassword, newPassword, ipAddress) => {
  const volunteer = await Member.findOne({ 
    _id: volunteerId,
    memberType: 'volunteer',
    softDelete: false 
  }).select('+password');

  if (!volunteer) {
    throw new Error('Volunteer not found');
  }

  // Verify old password
  const isPasswordValid = await volunteer.comparePassword(oldPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  volunteer.password = newPassword;
  await volunteer.save();

  // Create audit log
  await createAuditLog({
    userId: null,
    action: 'UPDATE',
    module: 'VOLUNTEER_AUTH',
    newData: { 
      volunteerId: volunteer._id,
      registrationId: volunteer.registrationId,
      action: 'password_changed'
    },
    ipAddress,
    notes: 'Volunteer password changed'
  });

  return { message: 'Password changed successfully' };
};

module.exports = {
  login,
  getProfile,
  changePassword,
  generateTokens
};
