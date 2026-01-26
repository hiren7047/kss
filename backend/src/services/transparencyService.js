const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const Wallet = require('../models/Wallet');
const Event = require('../models/Event');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const { createDateRangeFilter } = require('../utils/dateFilters');

/**
 * Get public wallet summary (transparency)
 * Only shows approved expenses and completed donations
 */
const getPublicWalletSummary = async () => {
  const wallet = await Wallet.getWallet();
  
  // Calculate verified totals from actual records
  const [donationsTotal, expensesTotal] = await Promise.all([
    Donation.aggregate([
      { $match: { softDelete: false, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: { softDelete: false, approvalStatus: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const verifiedTotalDonations = donationsTotal[0]?.total || 0;
  const verifiedTotalExpenses = expensesTotal[0]?.total || 0;
  const verifiedAvailableBalance = verifiedTotalDonations - verifiedTotalExpenses - (wallet.restrictedFunds || 0);

  return {
    totalDonations: verifiedTotalDonations,
    totalExpenses: verifiedTotalExpenses,
    availableBalance: Math.max(0, verifiedAvailableBalance),
    restrictedFunds: wallet.restrictedFunds || 0,
    lastUpdated: wallet.updatedAt || new Date()
  };
};

/**
 * Get public donations (transparency)
 * Shows only completed donations, respects anonymous flag
 */
const getPublicDonations = async (query) => {
  const { page, limit, skip } = getPagination(query.page || 1, query.limit || 20);
  const filter = { 
    softDelete: false,
    status: 'completed' // Only show completed donations
  };

  // Apply filters
  if (query.purpose) {
    filter.purpose = query.purpose;
  }
  if (query.paymentMode) {
    filter.paymentMode = query.paymentMode;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }

  // Date range filter
  const dateFilter = createDateRangeFilter(query.startDate, query.endDate);
  Object.assign(filter, dateFilter);

  const [donations, total] = await Promise.all([
    Donation.find(filter)
      .populate('eventId', 'name')
      .select('donorName amount purpose paymentMode createdAt receiptNumber eventId isAnonymous')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Donation.countDocuments(filter)
  ]);

  // Format donations for public view
  const formattedDonations = donations.map(donation => ({
    id: donation._id,
    donorName: donation.isAnonymous ? 'Anonymous Donor' : donation.donorName,
    amount: donation.amount,
    purpose: donation.purpose,
    paymentMode: donation.paymentMode,
    receiptNumber: donation.receiptNumber,
    eventName: donation.eventId?.name || null,
    date: donation.createdAt,
    isAnonymous: donation.isAnonymous
  }));

  return createPaginationResponse(formattedDonations, total, page, limit);
};

/**
 * Get public expenses (transparency)
 * Shows only approved expenses
 */
const getPublicExpenses = async (query) => {
  const { page, limit, skip } = getPagination(query.page || 1, query.limit || 20);
  const filter = { 
    softDelete: false,
    approvalStatus: 'approved' // Only show approved expenses
  };

  // Apply filters
  if (query.category) {
    filter.category = query.category;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }

  // Date range filter
  const dateFilter = createDateRangeFilter(query.startDate, query.endDate);
  Object.assign(filter, dateFilter);

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate('eventId', 'name')
      .populate('approvedBy', 'name')
      .select('title category amount eventId billUrl approvedBy createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter)
  ]);

  // Format expenses for public view
  const formattedExpenses = expenses.map(expense => ({
    id: expense._id,
    title: expense.title,
    category: expense.category,
    amount: expense.amount,
    eventName: expense.eventId?.name || null,
    billUrl: expense.billUrl || null,
    approvedBy: expense.approvedBy?.name || 'Admin',
    date: expense.createdAt
  }));

  return createPaginationResponse(formattedExpenses, total, page, limit);
};

/**
 * Get transparency summary with statistics
 */
const getTransparencySummary = async () => {
  const wallet = await getPublicWalletSummary();

  // Get donation statistics
  const donationStats = await Donation.aggregate([
    { $match: { softDelete: false, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        byPurpose: {
          $push: {
            purpose: '$purpose',
            amount: '$amount'
          }
        },
        byPaymentMode: {
          $push: {
            mode: '$paymentMode',
            amount: '$amount'
          }
        }
      }
    }
  ]);

  // Get expense statistics
  const expenseStats = await Expense.aggregate([
    { $match: { softDelete: false, approvalStatus: 'approved' } },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        byCategory: {
          $push: {
            category: '$category',
            amount: '$amount'
          }
        }
      }
    }
  ]);

  // Calculate purpose-wise donations
  const purposeBreakdown = {};
  if (donationStats[0]?.byPurpose) {
    donationStats[0].byPurpose.forEach(item => {
      purposeBreakdown[item.purpose] = (purposeBreakdown[item.purpose] || 0) + item.amount;
    });
  }

  // Calculate payment mode breakdown
  const paymentModeBreakdown = {};
  if (donationStats[0]?.byPaymentMode) {
    donationStats[0].byPaymentMode.forEach(item => {
      paymentModeBreakdown[item.mode] = (paymentModeBreakdown[item.mode] || 0) + item.amount;
    });
  }

  // Calculate category-wise expenses
  const categoryBreakdown = {};
  if (expenseStats[0]?.byCategory) {
    expenseStats[0].byCategory.forEach(item => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.amount;
    });
  }

  // Get monthly trends (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyDonations = await Donation.aggregate([
    {
      $match: {
        softDelete: false,
        status: 'completed',
        createdAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        softDelete: false,
        approvalStatus: 'approved',
        createdAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return {
    wallet,
    statistics: {
      donations: {
        totalCount: donationStats[0]?.totalCount || 0,
        totalAmount: donationStats[0]?.totalAmount || 0,
        byPurpose: purposeBreakdown,
        byPaymentMode: paymentModeBreakdown
      },
      expenses: {
        totalCount: expenseStats[0]?.totalCount || 0,
        totalAmount: expenseStats[0]?.totalAmount || 0,
        byCategory: categoryBreakdown
      }
    },
    trends: {
      monthlyDonations: monthlyDonations.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        total: item.total,
        count: item.count
      })),
      monthlyExpenses: monthlyExpenses.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        total: item.total,
        count: item.count
      }))
    }
  };
};

module.exports = {
  getPublicWalletSummary,
  getPublicDonations,
  getPublicExpenses,
  getTransparencySummary
};
