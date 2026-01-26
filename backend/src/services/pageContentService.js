const PageContent = require('../models/PageContent');
const ContentVersion = require('../models/ContentVersion');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');

/**
 * Create page content
 */
const createPageContent = async (pageData, userId, ipAddress) => {
  // Check if pageId + language combination already exists
  const existing = await PageContent.findOne({
    pageId: pageData.pageId,
    language: pageData.language,
    softDelete: false
  });

  if (existing) {
    throw new Error('Page content for this page and language already exists');
  }

  const pageContent = await PageContent.create({
    ...pageData,
    updatedBy: userId
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'PAGE_CONTENT',
    newData: pageContent.toObject(),
    ipAddress
  });

  return pageContent;
};

/**
 * Get all page contents with filters
 */
const getPageContents = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  if (query.pageId) {
    filter.pageId = query.pageId;
  }
  if (query.language) {
    filter.language = query.language;
  }
  if (query.status) {
    filter.status = query.status;
  }

  const [pageContents, total] = await Promise.all([
    PageContent.find(filter)
      .populate('updatedBy', 'name email')
      .populate('publishedBy', 'name email')
      .sort({ pageId: 1, language: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PageContent.countDocuments(filter)
  ]);

  return createPaginationResponse(pageContents, total, page, limit);
};

/**
 * Get page content by pageId and language
 */
const getPageContent = async (pageId, language) => {
  const pageContent = await PageContent.findOne({
    pageId,
    language,
    softDelete: false
  })
    .populate('updatedBy', 'name email')
    .populate('publishedBy', 'name email');

  if (!pageContent) {
    throw new Error('Page content not found');
  }

  return pageContent;
};

/**
 * Update page content
 */
const updatePageContent = async (pageId, language, updateData, userId, ipAddress) => {
  const pageContent = await PageContent.findOne({
    pageId,
    language,
    softDelete: false
  });

  if (!pageContent) {
    throw new Error('Page content not found');
  }

  const oldData = pageContent.toObject();
  
  // Increment version
  pageContent.version += 1;
  pageContent.updatedBy = userId;
  Object.assign(pageContent, updateData);
  await pageContent.save();

  // Save version history
  await ContentVersion.create({
    contentType: 'page',
    contentId: pageContent._id,
    version: pageContent.version,
    data: oldData,
    changedBy: userId,
    changeReason: updateData.changeReason || 'Content updated'
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'PAGE_CONTENT',
    oldData,
    newData: pageContent.toObject(),
    ipAddress
  });

  return pageContent;
};

/**
 * Publish page content
 */
const publishPageContent = async (pageId, language, userId, ipAddress, changeReason) => {
  const pageContent = await PageContent.findOne({
    pageId,
    language,
    softDelete: false
  });

  if (!pageContent) {
    throw new Error('Page content not found');
  }

  const oldData = pageContent.toObject();
  
  pageContent.status = 'published';
  pageContent.publishedAt = new Date();
  pageContent.publishedBy = userId;
  pageContent.version += 1;
  pageContent.updatedBy = userId;
  await pageContent.save();

  // Save version history
  await ContentVersion.create({
    contentType: 'page',
    contentId: pageContent._id,
    version: pageContent.version,
    data: oldData,
    changedBy: userId,
    changeReason: changeReason || 'Content published'
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: 'PUBLISH',
    module: 'PAGE_CONTENT',
    oldData,
    newData: pageContent.toObject(),
    ipAddress
  });

  return pageContent;
};

/**
 * Delete page content (soft delete)
 */
const deletePageContent = async (pageId, language, userId, ipAddress) => {
  const pageContent = await PageContent.findOne({
    pageId,
    language,
    softDelete: false
  });

  if (!pageContent) {
    throw new Error('Page content not found');
  }

  const oldData = pageContent.toObject();
  pageContent.softDelete = true;
  pageContent.updatedBy = userId;
  await pageContent.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'PAGE_CONTENT',
    oldData,
    ipAddress
  });

  return pageContent;
};

/**
 * Get version history
 */
const getVersionHistory = async (pageId, language) => {
  const pageContent = await PageContent.findOne({
    pageId,
    language,
    softDelete: false
  });

  if (!pageContent) {
    throw new Error('Page content not found');
  }

  const versions = await ContentVersion.find({
    contentType: 'page',
    contentId: pageContent._id
  })
    .populate('changedBy', 'name email')
    .sort({ version: -1 });

  return versions;
};

/**
 * Revert to previous version
 */
const revertToVersion = async (pageId, language, version, userId, ipAddress) => {
  const pageContent = await PageContent.findOne({
    pageId,
    language,
    softDelete: false
  });

  if (!pageContent) {
    throw new Error('Page content not found');
  }

  const versionData = await ContentVersion.findOne({
    contentType: 'page',
    contentId: pageContent._id,
    version
  });

  if (!versionData) {
    throw new Error('Version not found');
  }

  const oldData = pageContent.toObject();
  const versionContent = versionData.data;

  // Restore from version
  pageContent.sections = versionContent.sections;
  pageContent.metaTags = versionContent.metaTags;
  pageContent.version += 1;
  pageContent.updatedBy = userId;
  await pageContent.save();

  // Save new version
  await ContentVersion.create({
    contentType: 'page',
    contentId: pageContent._id,
    version: pageContent.version,
    data: oldData,
    changedBy: userId,
    changeReason: `Reverted to version ${version}`
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: 'REVERT',
    module: 'PAGE_CONTENT',
    oldData,
    newData: pageContent.toObject(),
    ipAddress
  });

  return pageContent;
};

module.exports = {
  createPageContent,
  getPageContents,
  getPageContent,
  updatePageContent,
  publishPageContent,
  deletePageContent,
  getVersionHistory,
  revertToVersion
};
