const documentService = require('../services/documentService');

/**
 * Upload document
 */
const uploadDocument = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const path = require('path');
    const { uploadDir } = require('../config/env');
    
    let fileUrl = req.body.fileUrl;
    if (req.file) {
      // Store relative path for easier serving
      const relativePath = path.relative(path.resolve(uploadDir), req.file.path);
      fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
    }
    
    const documentData = {
      ...req.body,
      fileUrl: fileUrl
    };
    const document = await documentService.uploadDocument(documentData, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents
 */
const getDocuments = async (req, res, next) => {
  try {
    const result = await documentService.getDocuments(req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document by ID
 */
const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update document
 */
const updateDocument = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const path = require('path');
    const { uploadDir } = require('../config/env');
    
    const updateData = { ...req.body };
    
    // If new file is uploaded, update fileUrl and delete old file
    if (req.file) {
      const relativePath = path.relative(path.resolve(uploadDir), req.file.path);
      updateData.fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
    }
    
    const document = await documentService.updateDocument(
      req.params.id, 
      updateData, 
      req.user._id, 
      ipAddress,
      req.file ? true : false
    );

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 */
const deleteDocument = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await documentService.deleteDocument(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
};


