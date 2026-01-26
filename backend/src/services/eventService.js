const Event = require('../models/Event');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const VolunteerAssignment = require('../models/VolunteerAssignment');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

/**
 * Create a new event
 */
const createEvent = async (eventData, userId, ipAddress) => {
  const event = await Event.create(eventData);

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'EVENT',
    newData: event.toObject(),
    ipAddress
  });

  return event;
};

/**
 * Get all events with pagination and filters
 */
const getEvents = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  // Apply filters
  if (query.status) {
    filter.status = query.status;
  }
  if (query.managerId) {
    filter.managerId = query.managerId;
  }

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('managerId', 'name email')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit),
    Event.countDocuments(filter)
  ]);

  return createPaginationResponse(events, total, page, limit);
};

/**
 * Get event by ID
 */
const getEventById = async (id) => {
  const event = await Event.findOne({ _id: id, softDelete: false })
    .populate('managerId', 'name email');
  
  if (!event) {
    throw new Error('Event not found');
  }
  return event;
};

/**
 * Update event
 */
const updateEvent = async (id, updateData, userId, ipAddress) => {
  const event = await Event.findOne({ _id: id, softDelete: false });
  if (!event) {
    throw new Error('Event not found');
  }

  const oldData = event.toObject();
  Object.assign(event, updateData);
  await event.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'EVENT',
    oldData,
    newData: event.toObject(),
    ipAddress
  });

  return event;
};

/**
 * Get event summary (donations, expenses, volunteers)
 */
const getEventSummary = async (id) => {
  const event = await Event.findOne({ _id: id, softDelete: false })
    .populate('managerId', 'name email');
  
  if (!event) {
    throw new Error('Event not found');
  }

  // Get donations for this event
  const donations = await Donation.find({
    eventId: id,
    softDelete: false,
    status: 'completed'
  });
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

  // Get expenses for this event
  const expenses = await Expense.find({
    eventId: id,
    softDelete: false,
    approvalStatus: 'approved'
  });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Get volunteers assigned
  const volunteers = await VolunteerAssignment.find({ eventId: id })
    .populate('volunteerId', 'name memberId');

  // Calculate target achievement
  const targetAmount = event.targetAmount || 0;
  const targetAchievement = targetAmount > 0 
    ? (totalDonations / targetAmount) * 100 
    : 0;

  return {
    event,
    summary: {
      targetAmount: targetAmount,
      totalDonations,
      targetAchievement: Math.min(100, targetAchievement),
      totalExpenses,
      remainingAmount: totalDonations - totalExpenses,
      budget: event.budget,
      budgetVariance: event.budget > 0 
        ? ((totalExpenses - event.budget) / event.budget) * 100 
        : 0,
      volunteerCount: volunteers.length
    },
    donations: {
      count: donations.length,
      total: totalDonations
    },
    expenses: {
      count: expenses.length,
      total: totalExpenses
    },
    volunteers
  };
};

/**
 * Soft delete event
 */
const deleteEvent = async (id, userId, ipAddress) => {
  const event = await Event.findOne({ _id: id, softDelete: false });
  if (!event) {
    throw new Error('Event not found');
  }

  const oldData = event.toObject();
  event.softDelete = true;
  await event.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'EVENT',
    oldData,
    newData: event.toObject(),
    ipAddress
  });

  return event;
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  getEventSummary,
  deleteEvent
};


