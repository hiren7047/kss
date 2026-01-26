const VolunteerRegistration = require('../models/VolunteerRegistration');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

const createVolunteerRegistration = async (registrationData) => {
  return await VolunteerRegistration.create(registrationData);
};

const getVolunteerRegistrations = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  if (query.status) {
    filter.status = query.status;
  }
  if (query.city) {
    filter.city = new RegExp(query.city, 'i');
  }

  const [registrations, total] = await Promise.all([
    VolunteerRegistration.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    VolunteerRegistration.countDocuments(filter)
  ]);

  return createPaginationResponse(registrations, total, page, limit);
};

const getVolunteerRegistration = async (id) => {
  const registration = await VolunteerRegistration.findOne({
    _id: id,
    softDelete: false
  }).populate('assignedTo', 'name email');

  if (!registration) {
    throw new Error('Volunteer registration not found');
  }

  return registration;
};

const updateVolunteerRegistration = async (id, updateData, userId, ipAddress) => {
  const registration = await VolunteerRegistration.findOne({
    _id: id,
    softDelete: false
  });

  if (!registration) {
    throw new Error('Volunteer registration not found');
  }

  const oldData = registration.toObject();
  Object.assign(registration, updateData);
  await registration.save();

  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'VOLUNTEER_REGISTRATION',
    oldData,
    newData: registration.toObject(),
    ipAddress
  });

  return registration;
};

const deleteVolunteerRegistration = async (id, userId, ipAddress) => {
  const registration = await VolunteerRegistration.findOne({
    _id: id,
    softDelete: false
  });

  if (!registration) {
    throw new Error('Volunteer registration not found');
  }

  const oldData = registration.toObject();
  registration.softDelete = true;
  await registration.save();

  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'VOLUNTEER_REGISTRATION',
    oldData,
    ipAddress
  });

  return registration;
};

module.exports = {
  createVolunteerRegistration,
  getVolunteerRegistrations,
  getVolunteerRegistration,
  updateVolunteerRegistration,
  deleteVolunteerRegistration
};
