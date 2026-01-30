const volunteerAuthService = require('../services/volunteerAuthService');

/**
 * Volunteer login
 */
const login = async (req, res) => {
  try {
    const { registrationId, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!registrationId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Registration ID and password are required'
      });
    }

    const result = await volunteerAuthService.login(registrationId, password, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

/**
 * Get volunteer profile
 */
const getProfile = async (req, res) => {
  try {
    const volunteer = await volunteerAuthService.getProfile(req.volunteer._id);

    res.status(200).json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Profile not found'
    });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    await volunteerAuthService.changePassword(req.volunteer._id, oldPassword, newPassword, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword
};
