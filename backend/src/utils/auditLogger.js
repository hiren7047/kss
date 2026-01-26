const AuditLog = require('../models/AuditLog');

/**
 * Create audit log entry
 * @param {Object} params - Audit log parameters
 * @param {String} params.userId - User ID
 * @param {String} params.action - Action (CREATE, UPDATE, DELETE, etc.)
 * @param {String} params.module - Module name
 * @param {Object} params.oldData - Old data (optional)
 * @param {Object} params.newData - New data (optional)
 * @param {String} params.ipAddress - IP address (optional)
 */
const createAuditLog = async ({ userId, action, module, oldData = null, newData = null, ipAddress = null }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      module,
      oldData,
      newData,
      ipAddress,
      timestamp: new Date()
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error('Error creating audit log:', error);
  }
};

module.exports = { createAuditLog };


