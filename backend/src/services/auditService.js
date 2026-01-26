const AuditLog = require('../models/AuditLog');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const { createDateRangeFilter } = require('../utils/dateFilters');

/**
 * Get audit logs with pagination and filters
 */
const getAuditLogs = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = {};

  // Apply filters
  if (query.userId) {
    filter.userId = query.userId;
  }
  if (query.module) {
    filter.module = query.module;
  }
  if (query.action) {
    filter.action = query.action;
  }

  // Date range filter
  const dateFilter = createDateRangeFilter(query.startDate, query.endDate);
  if (dateFilter.createdAt) {
    filter.timestamp = dateFilter.createdAt;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter)
  ]);

  return createPaginationResponse(logs, total, page, limit);
};

module.exports = {
  getAuditLogs
};


