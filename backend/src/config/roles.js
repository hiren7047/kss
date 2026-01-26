/**
 * User Roles Configuration
 * Defines all available roles in the system
 */
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  EVENT_MANAGER: 'EVENT_MANAGER',
  VOLUNTEER_MANAGER: 'VOLUNTEER_MANAGER',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  AUDITOR: 'AUDITOR'
};

/**
 * Get all roles as an array
 */
const getAllRoles = () => Object.values(ROLES);

/**
 * Check if a role is valid
 */
const isValidRole = (role) => Object.values(ROLES).includes(role);

module.exports = {
  ROLES,
  getAllRoles,
  isValidRole
};


