const Document = require('../models/Document');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../config/env');

/**
 * Upload/create document
 */
const uploadDocument = async (documentData, userId, ipAddress) => {
  const document = await Document.create({
    ...documentData,
    uploadedBy: userId
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'DOCUMENT',
    newData: document.toObject(),
    ipAddress
  });

  return document;
};

/**
 * Get all documents with pagination and filters
 */
const getDocuments = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = {};

  // Apply filters
  if (query.category) {
    filter.category = query.category;
  }
  if (query.visibility) {
    filter.visibility = query.visibility;
  }
  
  // Apply search filter
  if (query.search) {
    filter.title = { $regex: query.search, $options: 'i' };
  }

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(filter)
  ]);

  return createPaginationResponse(documents, total, page, limit);
};

/**
 * Get document by ID
 */
const getDocumentById = async (id) => {
  const document = await Document.findById(id)
    .populate('uploadedBy', 'name email');
  
  if (!document) {
    throw new Error('Document not found');
  }
  return document;
};

/**
 * Update document
 */
const updateDocument = async (id, updateData, userId, ipAddress) => {
  const document = await Document.findById(id);
  if (!document) {
    throw new Error('Document not found');
  }

  const oldData = document.toObject();
  Object.assign(document, updateData);
  await document.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'DOCUMENT',
    oldData,
    newData: document.toObject(),
    ipAddress
  });

  return document;
};

/**
 * Delete document
 */
const deleteDocument = async (id, userId, ipAddress) => {
  const document = await Document.findById(id);
  if (!document) {
    throw new Error('Document not found');
  }

  const oldData = document.toObject();
  const fileUrl = document.fileUrl;
  
  // Delete the document record
  await Document.findByIdAndDelete(id);
  
  // Delete the physical file
  if (fileUrl) {
    try {
      // Extract filename from fileUrl (could be /uploads/filename or full path)
      let filePath = fileUrl;
      if (fileUrl.startsWith('/uploads/')) {
        filePath = path.join(uploadDir, fileUrl.replace('/uploads/', ''));
      } else if (!path.isAbsolute(fileUrl)) {
        filePath = path.join(uploadDir, fileUrl);
      }
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Log error but don't fail the deletion
      console.error('Error deleting file:', error);
    }
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'DOCUMENT',
    oldData,
    ipAddress
  });

  return { message: 'Document deleted successfully' };
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
};


