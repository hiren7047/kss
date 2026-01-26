const EventItem = require('../models/EventItem');
const Donation = require('../models/Donation');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

/**
 * Create event item
 */
const createEventItem = async (itemData, userId, ipAddress) => {
  // Calculate total amount if not provided
  if (!itemData.totalAmount && itemData.unitPrice && itemData.totalQuantity) {
    itemData.totalAmount = itemData.unitPrice * itemData.totalQuantity;
  }

  const item = await EventItem.create(itemData);

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'EVENT_ITEM',
    newData: item.toObject(),
    ipAddress
  });

  return item;
};

/**
 * Get all event items for an event
 */
const getEventItems = async (eventId, query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { eventId, softDelete: false };

  if (query.status) {
    filter.status = query.status;
  }

  const [items, total] = await Promise.all([
    EventItem.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    EventItem.countDocuments(filter)
  ]);

  return createPaginationResponse(items, total, page, limit);
};

/**
 * Get event item by ID
 */
const getEventItemById = async (id) => {
  const item = await EventItem.findOne({ _id: id, softDelete: false });
  if (!item) {
    throw new Error('Event item not found');
  }
  return item;
};

/**
 * Update event item
 */
const updateEventItem = async (id, updateData, userId, ipAddress) => {
  const item = await EventItem.findOne({ _id: id, softDelete: false });
  if (!item) {
    throw new Error('Event item not found');
  }

  // Recalculate total amount if unit price or quantity changed
  if (updateData.unitPrice || updateData.totalQuantity) {
    const unitPrice = updateData.unitPrice || item.unitPrice;
    const totalQuantity = updateData.totalQuantity || item.totalQuantity;
    updateData.totalAmount = unitPrice * totalQuantity;
  }

  const oldData = item.toObject();
  Object.assign(item, updateData);
  item.updateStatus();
  await item.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'EVENT_ITEM',
    oldData,
    newData: item.toObject(),
    ipAddress
  });

  return item;
};

/**
 * Update item donations (called when donation is made for an item)
 */
const updateItemDonation = async (itemId, donationAmount, donationQuantity = 0) => {
  const item = await EventItem.findOne({ _id: itemId, softDelete: false });
  if (!item) {
    throw new Error('Event item not found');
  }

  item.donatedAmount = (item.donatedAmount || 0) + donationAmount;
  item.donatedQuantity = (item.donatedQuantity || 0) + donationQuantity;
  
  // Ensure we don't exceed totals
  item.donatedAmount = Math.min(item.donatedAmount, item.totalAmount);
  item.donatedQuantity = Math.min(item.donatedQuantity, item.totalQuantity);
  
  item.updateStatus();
  await item.save();

  return item;
};

/**
 * Delete event item (soft delete)
 */
const deleteEventItem = async (id, userId, ipAddress) => {
  const item = await EventItem.findOne({ _id: id, softDelete: false });
  if (!item) {
    throw new Error('Event item not found');
  }

  const oldData = item.toObject();
  item.softDelete = true;
  await item.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'EVENT_ITEM',
    oldData,
    newData: item.toObject(),
    ipAddress
  });

  return item;
};

/**
 * Get item donation details
 */
const getItemDonations = async (itemId) => {
  const item = await EventItem.findOne({ _id: itemId, softDelete: false });
  if (!item) {
    throw new Error('Event item not found');
  }

  const donations = await Donation.find({
    eventItemId: itemId,
    softDelete: false,
    status: 'completed'
  })
    .select('donorName amount itemQuantity createdAt paymentMode')
    .sort({ createdAt: -1 });

  return {
    item,
    donations,
    summary: {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      totalQuantity: donations.reduce((sum, d) => sum + (d.itemQuantity || 0), 0)
    }
  };
};

module.exports = {
  createEventItem,
  getEventItems,
  getEventItemById,
  updateEventItem,
  updateItemDonation,
  deleteEventItem,
  getItemDonations
};
