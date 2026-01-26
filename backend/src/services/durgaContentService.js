const DurgaContent = require('../models/DurgaContent');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

const createDurgaContent = async (durgaData, userId, ipAddress) => {
  const existing = await DurgaContent.findOne({
    durgaId: durgaData.durgaId,
    softDelete: false
  });

  if (existing) {
    throw new Error('Durga content already exists');
  }

  const durgaContent = await DurgaContent.create({
    ...durgaData,
    updatedBy: userId
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'DURGA_CONTENT',
    newData: durgaContent.toObject(),
    ipAddress
  });

  return durgaContent;
};

const getDurgaContents = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  if (query.durgaId) {
    filter.durgaId = query.durgaId;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  const [durgaContents, total] = await Promise.all([
    DurgaContent.find(filter)
      .populate('updatedBy', 'name email')
      .sort({ order: 1, durgaId: 1 })
      .skip(skip)
      .limit(limit),
    DurgaContent.countDocuments(filter)
  ]);

  return createPaginationResponse(durgaContents, total, page, limit);
};

const getDurgaContent = async (durgaId) => {
  const durgaContent = await DurgaContent.findOne({
    durgaId,
    softDelete: false
  }).populate('updatedBy', 'name email');

  if (!durgaContent) {
    throw new Error('Durga content not found');
  }

  return durgaContent;
};

const updateDurgaContent = async (durgaId, updateData, userId, ipAddress) => {
  const durgaContent = await DurgaContent.findOne({
    durgaId,
    softDelete: false
  });

  if (!durgaContent) {
    throw new Error('Durga content not found');
  }

  const oldData = durgaContent.toObject();
  durgaContent.updatedBy = userId;
  Object.assign(durgaContent, updateData);
  await durgaContent.save();

  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'DURGA_CONTENT',
    oldData,
    newData: durgaContent.toObject(),
    ipAddress
  });

  return durgaContent;
};

const deleteDurgaContent = async (durgaId, userId, ipAddress) => {
  const durgaContent = await DurgaContent.findOne({
    durgaId,
    softDelete: false
  });

  if (!durgaContent) {
    throw new Error('Durga content not found');
  }

  const oldData = durgaContent.toObject();
  durgaContent.softDelete = true;
  durgaContent.updatedBy = userId;
  await durgaContent.save();

  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'DURGA_CONTENT',
    oldData,
    ipAddress
  });

  return durgaContent;
};

module.exports = {
  createDurgaContent,
  getDurgaContents,
  getDurgaContent,
  updateDurgaContent,
  deleteDurgaContent
};
