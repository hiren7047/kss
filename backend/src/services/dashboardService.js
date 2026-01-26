const Member = require('../models/Member');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const Event = require('../models/Event');
const Wallet = require('../models/Wallet');
const VolunteerAssignment = require('../models/VolunteerAssignment');
const moment = require('moment');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = moment(now).startOf('month').toDate();
  const endOfMonth = moment(now).endOf('month').toDate();
  const startOfLastMonth = moment(now).subtract(1, 'month').startOf('month').toDate();
  const endOfLastMonth = moment(now).subtract(1, 'month').endOf('month').toDate();
  const thirtyDaysFromNow = moment(now).add(30, 'days').toDate();

  // Get wallet summary
  const wallet = await Wallet.getWallet();

  // Get total members
  const totalMembers = await Member.countDocuments({ softDelete: false });
  const activeMembers = await Member.countDocuments({ softDelete: false, status: 'active' });
  const activeVolunteers = await Member.countDocuments({
    softDelete: false,
    status: 'active',
    memberType: 'volunteer'
  });

  // Get donations
  const totalDonations = await Donation.aggregate([
    { $match: { softDelete: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalDonationsAmount = totalDonations[0]?.total || 0;

  const thisMonthDonations = await Donation.aggregate([
    {
      $match: {
        softDelete: false,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  const thisMonthDonationsAmount = thisMonthDonations[0]?.total || 0;
  const thisMonthDonationsCount = thisMonthDonations[0]?.count || 0;

  const lastMonthDonations = await Donation.aggregate([
    {
      $match: {
        softDelete: false,
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const lastMonthDonationsAmount = lastMonthDonations[0]?.total || 0;

  // Get expenses
  const totalExpenses = await Expense.aggregate([
    { $match: { softDelete: false, approvalStatus: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalExpensesAmount = totalExpenses[0]?.total || 0;

  const pendingExpenses = await Expense.countDocuments({
    softDelete: false,
    approvalStatus: 'pending'
  });

  const thisMonthExpenses = await Expense.aggregate([
    {
      $match: {
        softDelete: false,
        approvalStatus: 'approved',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const thisMonthExpensesAmount = thisMonthExpenses[0]?.total || 0;

  // Get events
  const totalEvents = await Event.countDocuments({ softDelete: false });
  const activeEvents = await Event.countDocuments({
    softDelete: false,
    status: 'ongoing'
  });
  const upcomingEvents = await Event.countDocuments({
    softDelete: false,
    startDate: { $gte: now, $lte: thirtyDaysFromNow },
    status: { $in: ['planned', 'ongoing'] }
  });

  // Calculate trends
  const donationsTrend = lastMonthDonationsAmount > 0
    ? ((thisMonthDonationsAmount - lastMonthDonationsAmount) / lastMonthDonationsAmount * 100).toFixed(1)
    : 0;

  return {
    wallet: {
      availableBalance: wallet.availableBalance,
      totalDonations: wallet.totalDonations,
      totalExpenses: wallet.totalExpenses,
      restrictedFunds: wallet.restrictedFunds
    },
    members: {
      total: totalMembers,
      active: activeMembers,
      activeVolunteers: activeVolunteers
    },
    donations: {
      total: totalDonationsAmount,
      thisMonth: thisMonthDonationsAmount,
      thisMonthCount: thisMonthDonationsCount,
      trend: parseFloat(donationsTrend)
    },
    expenses: {
      total: totalExpensesAmount,
      thisMonth: thisMonthExpensesAmount,
      pending: pendingExpenses
    },
    events: {
      total: totalEvents,
      active: activeEvents,
      upcoming: upcomingEvents
    }
  };
};

module.exports = {
  getDashboardStats
};
