const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn, jwtRefreshExpiresIn } = require('../config/env');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });
  const refreshToken = jwt.sign({ userId }, jwtSecret, { expiresIn: jwtRefreshExpiresIn });
  return { accessToken, refreshToken };
};

/**
 * Login service
 */
const login = async (email, mobile, password, ipAddress) => {
  // Find user by email or mobile
  const query = email ? { email } : { mobile };
  const user = await User.findOne(query);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new Error('Account is inactive');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Update user
  user.lastLogin = new Date();
  user.refreshToken = refreshToken;
  await user.save();

  // Create audit log
  await createAuditLog({
    userId: user._id,
    action: 'LOGIN',
    module: 'AUTH',
    newData: { loginTime: user.lastLogin },
    ipAddress
  });

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken
  };
};

/**
 * Refresh token service
 */
const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      throw new Error('Invalid refresh token');
    }

    if (user.status !== 'active') {
      throw new Error('Account is inactive');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Logout service
 */
const logout = async (userId, ipAddress) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();

    // Create audit log
    await createAuditLog({
      userId,
      action: 'LOGOUT',
      module: 'AUTH',
      ipAddress
    });
  }
};

/**
 * Register new admin user
 */
const register = async (userData, ipAddress) => {
  const { name, email, mobile, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { mobile }]
  });

  if (existingUser) {
    throw new Error('User with this email or mobile already exists');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    mobile,
    password,
    role: role || 'ADMIN',
    status: 'active'
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Update user with refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Create audit log
  await createAuditLog({
    userId: user._id,
    action: 'CREATE',
    module: 'USER',
    newData: { name, email, mobile, role: user.role },
    ipAddress
  });

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken
  };
};

module.exports = {
  login,
  refreshToken,
  logout,
  register
};


