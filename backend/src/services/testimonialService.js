const Testimonial = require('../models/Testimonial');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

const createTestimonial = async (testimonialData, userId, ipAddress) => {
  const testimonial = await Testimonial.create({
    ...testimonialData,
    createdBy: userId
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'TESTIMONIAL',
    newData: testimonial.toObject(),
    ipAddress
  });

  return testimonial;
};

const getTestimonials = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  if (query.language) {
    filter.language = query.language;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  const [testimonials, total] = await Promise.all([
    Testimonial.find(filter)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Testimonial.countDocuments(filter)
  ]);

  return createPaginationResponse(testimonials, total, page, limit);
};

const getTestimonial = async (id) => {
  const testimonial = await Testimonial.findOne({
    _id: id,
    softDelete: false
  })
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!testimonial) {
    throw new Error('Testimonial not found');
  }

  return testimonial;
};

const updateTestimonial = async (id, updateData, userId, ipAddress) => {
  const testimonial = await Testimonial.findOne({
    _id: id,
    softDelete: false
  });

  if (!testimonial) {
    throw new Error('Testimonial not found');
  }

  const oldData = testimonial.toObject();
  Object.assign(testimonial, updateData);
  await testimonial.save();

  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'TESTIMONIAL',
    oldData,
    newData: testimonial.toObject(),
    ipAddress
  });

  return testimonial;
};

const approveTestimonial = async (id, isActive, userId, ipAddress) => {
  const testimonial = await Testimonial.findOne({
    _id: id,
    softDelete: false
  });

  if (!testimonial) {
    throw new Error('Testimonial not found');
  }

  const oldData = testimonial.toObject();
  testimonial.isActive = isActive;
  testimonial.approvedBy = userId;
  testimonial.approvedAt = new Date();
  await testimonial.save();

  await createAuditLog({
    userId,
    action: isActive ? 'APPROVE' : 'REJECT',
    module: 'TESTIMONIAL',
    oldData,
    newData: testimonial.toObject(),
    ipAddress
  });

  return testimonial;
};

const deleteTestimonial = async (id, userId, ipAddress) => {
  const testimonial = await Testimonial.findOne({
    _id: id,
    softDelete: false
  });

  if (!testimonial) {
    throw new Error('Testimonial not found');
  }

  const oldData = testimonial.toObject();
  testimonial.softDelete = true;
  await testimonial.save();

  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'TESTIMONIAL',
    oldData,
    ipAddress
  });

  return testimonial;
};

module.exports = {
  createTestimonial,
  getTestimonials,
  getTestimonial,
  updateTestimonial,
  approveTestimonial,
  deleteTestimonial
};
