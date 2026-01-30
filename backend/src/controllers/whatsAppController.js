const whatsAppService = require('../services/whatsAppService');

/**
 * Create WhatsApp message template
 */
const createTemplate = async (req, res, next) => {
  try {
    const template = await whatsAppService.createTemplate(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all templates
 */
const getTemplates = async (req, res, next) => {
  try {
    const result = await whatsAppService.getTemplates(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get template by ID
 */
const getTemplateById = async (req, res, next) => {
  try {
    const template = await whatsAppService.getTemplateById(req.params.id);
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update template
 */
const updateTemplate = async (req, res, next) => {
  try {
    const template = await whatsAppService.updateTemplate(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete template
 */
const deleteTemplate = async (req, res, next) => {
  try {
    await whatsAppService.deleteTemplate(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send WhatsApp message
 */
const sendMessage = async (req, res, next) => {
  try {
    const message = await whatsAppService.sendMessage(req.body, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send bulk WhatsApp messages
 */
const sendBulkMessages = async (req, res, next) => {
  try {
    const result = await whatsAppService.sendBulkMessages(req.body, req.user._id);
    res.status(200).json({
      success: true,
      message: `Messages processed: ${result.success.length} sent, ${result.failed.length} failed`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sent messages
 */
const getMessages = async (req, res, next) => {
  try {
    const result = await whatsAppService.getMessages(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get message statistics
 */
const getMessageStatistics = async (req, res, next) => {
  try {
    const statistics = await whatsAppService.getMessageStatistics(req.query);
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  sendMessage,
  sendBulkMessages,
  getMessages,
  getMessageStatistics
};
