const GalleryItem = require('../models/GalleryItem');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

const createGalleryItem = async (galleryData, userId, ipAddress) => {
  const galleryItem = await GalleryItem.create({
    ...galleryData,
    uploadedBy: userId
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'GALLERY',
    newData: galleryItem.toObject(),
    ipAddress
  });

  return galleryItem;
};

const getGalleryItems = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  if (query.category) {
    filter.category = query.category;
  }
  if (query.type) {
    filter.type = query.type;
  }
  if (query.durgaId) {
    filter.durgaId = query.durgaId;
  }
  if (query.eventId) {
    filter.eventId = query.eventId;
  }
  if (query.isFeatured !== undefined) {
    filter.isFeatured = query.isFeatured;
  }

  const [galleryItems, total] = await Promise.all([
    GalleryItem.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('eventId', 'name')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    GalleryItem.countDocuments(filter)
  ]);

  return createPaginationResponse(galleryItems, total, page, limit);
};

const getGalleryItem = async (id) => {
  const galleryItem = await GalleryItem.findOne({
    _id: id,
    softDelete: false
  })
    .populate('uploadedBy', 'name email')
    .populate('eventId', 'name');

  if (!galleryItem) {
    throw new Error('Gallery item not found');
  }

  return galleryItem;
};

const updateGalleryItem = async (id, updateData, userId, ipAddress) => {
  const galleryItem = await GalleryItem.findOne({
    _id: id,
    softDelete: false
  });

  if (!galleryItem) {
    throw new Error('Gallery item not found');
  }

  const oldData = galleryItem.toObject();
  Object.assign(galleryItem, updateData);
  await galleryItem.save();

  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'GALLERY',
    oldData,
    newData: galleryItem.toObject(),
    ipAddress
  });

  return galleryItem;
};

const deleteGalleryItem = async (id, userId, ipAddress) => {
  const galleryItem = await GalleryItem.findOne({
    _id: id,
    softDelete: false
  });

  if (!galleryItem) {
    throw new Error('Gallery item not found');
  }

  const oldData = galleryItem.toObject();
  galleryItem.softDelete = true;
  await galleryItem.save();

  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'GALLERY',
    oldData,
    ipAddress
  });

  return galleryItem;
};

module.exports = {
  createGalleryItem,
  getGalleryItems,
  getGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
