const moment = require('moment');

/**
 * Create date range filter for MongoDB queries
 * @param {String} startDate - Start date (ISO string or date)
 * @param {String} endDate - End date (ISO string or date)
 * @returns {Object} - MongoDB date filter
 */
const createDateRangeFilter = (startDate, endDate) => {
  const filter = {};
  
  if (startDate || endDate) {
    filter.createdAt = {};
    
    if (startDate) {
      filter.createdAt.$gte = moment(startDate).startOf('day').toDate();
    }
    
    if (endDate) {
      filter.createdAt.$lte = moment(endDate).endOf('day').toDate();
    }
  }
  
  return filter;
};

/**
 * Get date range for common periods
 * @param {String} period - 'today', 'week', 'month', 'year'
 * @returns {Object} - Object with startDate and endDate
 */
const getDateRange = (period) => {
  const now = moment();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = now.startOf('day').toDate();
      endDate = now.endOf('day').toDate();
      break;
    case 'week':
      startDate = now.startOf('week').toDate();
      endDate = now.endOf('week').toDate();
      break;
    case 'month':
      startDate = now.startOf('month').toDate();
      endDate = now.endOf('month').toDate();
      break;
    case 'year':
      startDate = now.startOf('year').toDate();
      endDate = now.endOf('year').toDate();
      break;
    default:
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
};

module.exports = {
  createDateRangeFilter,
  getDateRange
};


