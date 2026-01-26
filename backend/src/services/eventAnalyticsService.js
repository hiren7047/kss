const Event = require('../models/Event');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const EventItem = require('../models/EventItem');
const EventExpensePlan = require('../models/EventExpensePlan');
const VolunteerAssignment = require('../models/VolunteerAssignment');
const mongoose = require('mongoose');

/**
 * Get comprehensive event financial analytics
 */
const getEventFinancialAnalytics = async (eventId) => {
  const event = await Event.findOne({ _id: eventId, softDelete: false });
  if (!event) {
    throw new Error('Event not found');
  }

  // Get all donations for this event
  const donations = await Donation.find({
    eventId: eventId,
    softDelete: false,
    status: 'completed'
  });

  // Get all expenses for this event
  const expenses = await Expense.find({
    eventId: eventId,
    softDelete: false
  });

  // Get approved expenses
  const approvedExpenses = expenses.filter(e => e.approvalStatus === 'approved');
  const pendingExpenses = expenses.filter(e => e.approvalStatus === 'pending');

  // Calculate totals
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalApprovedExpenses = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPendingExpenses = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Target vs Actual
  const targetAmount = event.targetAmount || 0;
  const targetAchievement = targetAmount > 0 
    ? (totalDonations / targetAmount) * 100 
    : 0;

  // Get item-based donations
  const itemDonations = donations.filter(d => d.donationType === 'item_specific' && d.eventItemId);
  const itemDonationTotal = itemDonations.reduce((sum, d) => sum + d.amount, 0);

  // Get general donations
  const generalDonations = donations.filter(d => d.donationType === 'general');
  const generalDonationTotal = generalDonations.reduce((sum, d) => sum + d.amount, 0);

  // Get event items
  const eventItems = await EventItem.find({
    eventId: eventId,
    softDelete: false
  });

  // Calculate item statistics
  const itemStats = eventItems.map(item => ({
    itemId: item._id,
    name: item.name,
    totalAmount: item.totalAmount,
    donatedAmount: item.donatedAmount,
    remainingAmount: item.totalAmount - item.donatedAmount,
    totalQuantity: item.totalQuantity,
    donatedQuantity: item.donatedQuantity,
    remainingQuantity: item.totalQuantity - item.donatedQuantity,
    completionPercentage: item.totalAmount > 0 
      ? (item.donatedAmount / item.totalAmount) * 100 
      : 0,
    status: item.status
  }));

  const totalItemTarget = eventItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalItemDonated = eventItems.reduce((sum, item) => sum + item.donatedAmount, 0);

  // Get expense plans
  const expensePlans = await EventExpensePlan.find({
    eventId: eventId,
    softDelete: false
  });

  const plannedExpenses = expensePlans.filter(ep => ep.status === 'planned');
  const completedExpenses = expensePlans.filter(ep => ep.status === 'completed');

  const totalPlannedAmount = expensePlans.reduce((sum, ep) => sum + ep.estimatedAmount, 0);
  const totalActualAmount = expensePlans.reduce((sum, ep) => sum + ep.actualAmount, 0);

  // Financial health indicators
  const availableBalance = totalDonations - totalApprovedExpenses;
  const projectedBalance = totalDonations - totalApprovedExpenses - totalPendingExpenses;
  const budgetVariance = event.budget > 0 
    ? ((totalApprovedExpenses - event.budget) / event.budget) * 100 
    : 0;

  // Donation trends (by date)
  const donationsByDate = {};
  donations.forEach(donation => {
    const date = donation.createdAt.toISOString().split('T')[0];
    if (!donationsByDate[date]) {
      donationsByDate[date] = { count: 0, amount: 0 };
    }
    donationsByDate[date].count++;
    donationsByDate[date].amount += donation.amount;
  });

  // Payment mode distribution
  const paymentModeDistribution = {};
  donations.forEach(donation => {
    const mode = donation.paymentMode;
    if (!paymentModeDistribution[mode]) {
      paymentModeDistribution[mode] = { count: 0, amount: 0 };
    }
    paymentModeDistribution[mode].count++;
    paymentModeDistribution[mode].amount += donation.amount;
  });

  return {
    event: {
      id: event._id,
      _id: event._id,
      name: event.name,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      targetAmount: targetAmount,
      budget: event.budget,
      status: event.status,
      managerId: event.managerId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    },
    financialSummary: {
      targetAmount: targetAmount,
      totalDonations: totalDonations,
      targetAchievement: Math.min(100, targetAchievement),
      targetRemaining: Math.max(0, targetAmount - totalDonations),
      totalApprovedExpenses: totalApprovedExpenses,
      totalPendingExpenses: totalPendingExpenses,
      totalExpenses: totalExpenses,
      availableBalance: availableBalance,
      projectedBalance: projectedBalance,
      budgetVariance: budgetVariance,
      budgetStatus: budgetVariance > 0 ? 'over_budget' : budgetVariance < -10 ? 'under_budget' : 'on_budget'
    },
    donationAnalysis: {
      total: totalDonations,
      count: donations.length,
      generalDonations: {
        total: generalDonationTotal,
        count: generalDonations.length,
        percentage: totalDonations > 0 ? (generalDonationTotal / totalDonations) * 100 : 0
      },
      itemDonations: {
        total: itemDonationTotal,
        count: itemDonations.length,
        percentage: totalDonations > 0 ? (itemDonationTotal / totalDonations) * 100 : 0
      },
      byDate: donationsByDate,
      byPaymentMode: paymentModeDistribution,
      averageDonation: donations.length > 0 ? totalDonations / donations.length : 0
    },
    itemAnalysis: {
      totalItems: eventItems.length,
      totalItemTarget: totalItemTarget,
      totalItemDonated: totalItemDonated,
      itemCompletionPercentage: totalItemTarget > 0 
        ? (totalItemDonated / totalItemTarget) * 100 
        : 0,
      items: itemStats,
      itemsByStatus: {
        pending: eventItems.filter(i => i.status === 'pending').length,
        partial: eventItems.filter(i => i.status === 'partial').length,
        completed: eventItems.filter(i => i.status === 'completed').length
      }
    },
    expenseAnalysis: {
      totalPlanned: totalPlannedAmount,
      totalActual: totalActualAmount,
      variance: totalActualAmount - totalPlannedAmount,
      variancePercentage: totalPlannedAmount > 0 
        ? ((totalActualAmount - totalPlannedAmount) / totalPlannedAmount) * 100 
        : 0,
      plannedCount: plannedExpenses.length,
      completedCount: completedExpenses.length,
      totalPlannedExpenses: expensePlans.length
    },
    recommendations: generateRecommendations({
      targetAchievement,
      availableBalance,
      budgetVariance,
      itemStats,
      totalPendingExpenses
    })
  };
};

/**
 * Generate recommendations based on analytics
 */
const generateRecommendations = (data) => {
  const recommendations = [];

  if (data.targetAchievement < 50) {
    recommendations.push({
      type: 'donation',
      priority: 'high',
      message: 'Event target achievement is below 50%. Consider promoting the event more actively.',
      action: 'Increase marketing and outreach efforts'
    });
  }

  if (data.availableBalance < 0) {
    recommendations.push({
      type: 'financial',
      priority: 'critical',
      message: 'Available balance is negative. Review expenses and consider additional fundraising.',
      action: 'Review approved expenses or seek additional donations'
    });
  }

  if (data.budgetVariance > 20) {
    recommendations.push({
      type: 'budget',
      priority: 'high',
      message: 'Expenses are significantly over budget. Review and optimize costs.',
      action: 'Review expense plans and find cost-saving opportunities'
    });
  }

  const incompleteItems = data.itemStats.filter(item => item.status !== 'completed');
  if (incompleteItems.length > 0) {
    recommendations.push({
      type: 'items',
      priority: 'medium',
      message: `${incompleteItems.length} items still need funding. Consider highlighting these in donation campaigns.`,
      action: 'Promote specific item donations'
    });
  }

  if (data.totalPendingExpenses > 0) {
    recommendations.push({
      type: 'expenses',
      priority: 'medium',
      message: 'There are pending expenses that need approval.',
      action: 'Review and approve/reject pending expenses'
    });
  }

  return recommendations;
};

/**
 * Get event dashboard data
 */
const getEventDashboard = async (eventId) => {
  const analytics = await getEventFinancialAnalytics(eventId);
  
  // Get full event object
  const fullEvent = await Event.findOne({ _id: eventId, softDelete: false })
    .populate('managerId', 'name email');
  
  // Get recent donations (last 10)
  const recentDonations = await Donation.find({
    eventId: eventId,
    softDelete: false,
    status: 'completed'
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('eventItemId', 'name')
    .select('donorName amount donationType eventItemId createdAt paymentMode');

  // Get upcoming expenses
  const upcomingExpenses = await EventExpensePlan.find({
    eventId: eventId,
    softDelete: false,
    status: { $in: ['planned', 'in_progress'] }
  })
    .sort({ plannedDate: 1 })
    .limit(10)
    .select('title estimatedAmount plannedDate status priority');

  // Get top donors
  const topDonors = await Donation.aggregate([
    {
      $match: {
        eventId: new mongoose.Types.ObjectId(eventId),
        softDelete: false,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$donorName',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalAmount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  return {
    ...analytics,
    event: fullEvent ? {
      _id: fullEvent._id,
      id: fullEvent._id,
      name: fullEvent.name,
      description: fullEvent.description,
      location: fullEvent.location,
      startDate: fullEvent.startDate,
      endDate: fullEvent.endDate,
      targetAmount: fullEvent.targetAmount,
      budget: fullEvent.budget,
      status: fullEvent.status,
      managerId: fullEvent.managerId,
      createdAt: fullEvent.createdAt,
      updatedAt: fullEvent.updatedAt
    } : analytics.event,
    recentDonations,
    upcomingExpenses,
    topDonors
  };
};

/**
 * Get event items with donation details
 */
const getEventItemsWithDonations = async (eventId) => {
  const items = await EventItem.find({
    eventId: eventId,
    softDelete: false
  }).sort({ priority: -1, createdAt: -1 });

  const itemsWithDonations = await Promise.all(
    items.map(async (item) => {
      const donations = await Donation.find({
        eventItemId: item._id,
        softDelete: false,
        status: 'completed'
      })
        .select('donorName amount itemQuantity createdAt')
        .sort({ createdAt: -1 });

      return {
        ...item.toObject(),
        donations: donations,
        donationCount: donations.length
      };
    })
  );

  return itemsWithDonations;
};

module.exports = {
  getEventFinancialAnalytics,
  getEventDashboard,
  getEventItemsWithDonations,
  generateRecommendations
};
