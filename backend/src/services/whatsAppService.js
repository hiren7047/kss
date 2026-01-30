const axios = require('axios');
const WhatsAppMessageTemplate = require('../models/WhatsAppMessageTemplate');
const WhatsAppMessage = require('../models/WhatsAppMessage');
const Member = require('../models/Member');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const { createAuditLog } = require('../utils/auditLogger');

// WhatsApp API Configuration
const WHATSAPP_API_BASE_URL = 'http://login.1bot.in/wapp/v2/api';
const WHATSAPP_API_KEY = 'c266a3f87bae4e209050834b27d669ba';
const DEFAULT_COUNTRY_CODE = 'IN';

/**
 * Replace template variables in message
 * @param {string} message - Message template with variables like {{name}}
 * @param {object} variables - Object with variable values
 * @returns {string} - Message with replaced variables
 */
const replaceTemplateVariables = (message, variables = {}) => {
  let processedMessage = message;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processedMessage = processedMessage.replace(regex, variables[key] || '');
  });
  return processedMessage;
};

/**
 * Send WhatsApp message via API
 * @param {object} messageData - Message data
 * @returns {object} - API response
 */
const sendWhatsAppMessage = async (messageData) => {
  try {
    const {
      mobile,
      msg,
      pdf = null,
      img1 = null,
      img2 = null,
      scheduleon = null,
      country = DEFAULT_COUNTRY_CODE
    } = messageData;

    // Build query parameters
    const params = new URLSearchParams({
      apikey: WHATSAPP_API_KEY,
      mobile: mobile,
      msg: msg,
      country: country
    });

    if (pdf) params.append('pdf', pdf);
    if (img1) params.append('img1', img1);
    if (img2) params.append('img2', img2);
    if (scheduleon) params.append('scheduleon', scheduleon);

    const url = `${WHATSAPP_API_BASE_URL}/send?${params.toString()}`;

    const response = await axios.get(url, {
      timeout: 30000 // 30 seconds timeout
    });

    return {
      success: response.data.status === 'success',
      data: response.data,
      statusCode: response.data.statuscode || response.status
    };
  } catch (error) {
    // Handle API errors
    if (error.response) {
      return {
        success: false,
        data: error.response.data || {},
        statusCode: error.response.status,
        error: error.response.data?.errormsg || error.message
      };
    }
    return {
      success: false,
      data: {},
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * Create WhatsApp message template
 */
const createTemplate = async (templateData, userId) => {
  // Extract variables from message (e.g., {{name}}, {{amount}})
  const variableRegex = /\{\{(\w+)\}\}/g;
  const variables = [];
  let match;
  while ((match = variableRegex.exec(templateData.message)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  const template = await WhatsAppMessageTemplate.create({
    ...templateData,
    variables,
    createdBy: userId
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'WHATSAPP_TEMPLATE',
    newData: template,
    ipAddress: 'system'
  });

  return template;
};

/**
 * Get all templates
 */
const getTemplates = async (query = {}) => {
  const { page = 1, limit = 20, status, search } = query;
  const skip = (page - 1) * limit;

  const filter = { softDelete: false };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const [templates, total] = await Promise.all([
    WhatsAppMessageTemplate.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WhatsAppMessageTemplate.countDocuments(filter)
  ]);

  return {
    data: templates,
    pagination: createPaginationResponse(total, page, limit)
  };
};

/**
 * Get template by ID
 */
const getTemplateById = async (templateId) => {
  const template = await WhatsAppMessageTemplate.findOne({
    _id: templateId,
    softDelete: false
  }).populate('createdBy', 'name email').populate('updatedBy', 'name email');

  if (!template) {
    throw new Error('Template not found');
  }

  return template;
};

/**
 * Update template
 */
const updateTemplate = async (templateId, templateData, userId) => {
  const template = await WhatsAppMessageTemplate.findOne({
    _id: templateId,
    softDelete: false
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Extract variables from message if message is being updated
  if (templateData.message) {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;
    while ((match = variableRegex.exec(templateData.message)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    templateData.variables = variables;
  }

  const oldData = { ...template.toObject() };
  Object.assign(template, templateData, { updatedBy: userId });
  await template.save();

  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'WHATSAPP_TEMPLATE',
    oldData,
    newData: template,
    ipAddress: 'system'
  });

  return template;
};

/**
 * Delete template (soft delete)
 */
const deleteTemplate = async (templateId, userId) => {
  const template = await WhatsAppMessageTemplate.findOne({
    _id: templateId,
    softDelete: false
  });

  if (!template) {
    throw new Error('Template not found');
  }

  template.softDelete = true;
  template.updatedBy = userId;
  await template.save();

  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'WHATSAPP_TEMPLATE',
    oldData: template,
    ipAddress: 'system'
  });

  return template;
};

/**
 * Send WhatsApp message to single recipient
 */
const sendMessage = async (messageData, userId) => {
  const {
    templateId,
    recipientId,
    recipientMobile,
    message,
    pdf,
    img1,
    img2,
    variables = {},
    scheduleon
  } = messageData;

  let finalMessage = message;
  let recipientName = '';
  let mobile = recipientMobile;

  // If template is provided, use it
  if (templateId) {
    const template = await getTemplateById(templateId);
    finalMessage = replaceTemplateVariables(template.message, variables);
    
    // Use template media if not provided
    if (!pdf && template.pdf) messageData.pdf = template.pdf;
    if (!img1 && template.img1) messageData.img1 = template.img1;
    if (!img2 && template.img2) messageData.img2 = template.img2;

    // Update template usage
    template.usageCount += 1;
    template.lastUsedAt = new Date();
    await template.save();
  }

  // If recipientId is provided, get member details
  if (recipientId) {
    const member = await Member.findById(recipientId);
    if (member) {
      recipientName = member.name || '';
      mobile = member.whatsappNumber || member.mobile;
      
      // Auto-replace common variables
      if (!variables.name) variables.name = recipientName;
      if (!variables.memberId) variables.memberId = member.memberId || '';
      
      finalMessage = replaceTemplateVariables(finalMessage, variables);
    }
  } else if (variables.name) {
    recipientName = variables.name;
    finalMessage = replaceTemplateVariables(finalMessage, variables);
  }

  // Validate mobile number
  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    throw new Error('Valid 10-digit mobile number is required');
  }

  // Create message record
  const messageRecord = await WhatsAppMessage.create({
    templateId: templateId || null,
    recipientId: recipientId || null,
    recipientMobile: mobile,
    recipientName,
    message: finalMessage,
    pdf: pdf || null,
    img1: img1 || null,
    img2: img2 || null,
    status: scheduleon ? 'scheduled' : 'pending',
    scheduledFor: scheduleon ? new Date(scheduleon) : null,
    sentBy: userId
  });

  // Send message if not scheduled
  if (!scheduleon) {
    try {
      const apiResponse = await sendWhatsAppMessage({
        mobile,
        msg: finalMessage,
        pdf: messageRecord.pdf,
        img1: messageRecord.img1,
        img2: messageRecord.img2
      });

      // Update message record with API response
      messageRecord.status = apiResponse.success ? 'sent' : 'failed';
      messageRecord.statusCode = apiResponse.statusCode;
      messageRecord.apiRequestId = apiResponse.data?.requestid || null;
      messageRecord.apiResponse = apiResponse.data || {};
      messageRecord.msgCount = apiResponse.data?.msgcount || 0;
      messageRecord.msgCost = apiResponse.data?.msgcost || 0;
      messageRecord.sentAt = apiResponse.success ? new Date() : null;
      messageRecord.errorMessage = apiResponse.error || null;

      await messageRecord.save();
    } catch (error) {
      messageRecord.status = 'failed';
      messageRecord.errorMessage = error.message;
      await messageRecord.save();
      throw error;
    }
  }

  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'WHATSAPP_MESSAGE',
    newData: messageRecord,
    ipAddress: 'system'
  });

  return messageRecord;
};

/**
 * Send WhatsApp messages to multiple recipients
 */
const sendBulkMessages = async (bulkData, userId) => {
  const {
    templateId,
    recipientIds = [],
    memberTypes = [],
    memberStatuses = [],
    message,
    pdf,
    img1,
    img2,
    variables = {},
    scheduleon
  } = bulkData;

  // Build member query
  const memberQuery = { softDelete: false };
  if (recipientIds.length > 0) {
    memberQuery._id = { $in: recipientIds };
  }
  if (memberTypes.length > 0) {
    memberQuery.memberType = { $in: memberTypes };
  }
  if (memberStatuses.length > 0) {
    memberQuery.status = { $in: memberStatuses };
  }

  // Get members
  const members = await Member.find(memberQuery);
  
  if (members.length === 0) {
    throw new Error('No members found matching the criteria');
  }

  if (members.length > 5000) {
    throw new Error('Maximum 5000 recipients allowed per batch');
  }

  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const results = {
    success: [],
    failed: [],
    total: members.length
  };

  // Send messages (with rate limiting consideration)
  for (const member of members) {
    try {
      const mobile = member.whatsappNumber || member.mobile;
      if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
        results.failed.push({
          memberId: member._id,
          name: member.name,
          mobile,
          error: 'Invalid mobile number'
        });
        continue;
      }

      const memberVariables = {
        ...variables,
        name: member.name || '',
        memberId: member.memberId || ''
      };

      const messageRecord = await sendMessage({
        templateId,
        recipientId: member._id,
        recipientMobile: mobile,
        message,
        pdf,
        img1,
        img2,
        variables: memberVariables,
        scheduleon
      }, userId);

      // Add batch ID
      messageRecord.batchId = batchId;
      await messageRecord.save();

      results.success.push({
        messageId: messageRecord._id,
        memberId: member._id,
        name: member.name,
        mobile
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.failed.push({
        memberId: member._id,
        name: member.name,
        mobile: member.whatsappNumber || member.mobile,
        error: error.message
      });
    }
  }

  return {
    batchId,
    ...results
  };
};

/**
 * Get sent messages
 */
const getMessages = async (query = {}) => {
  const { page = 1, limit = 20, status, templateId, batchId, search } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;
  if (templateId) filter.templateId = templateId;
  if (batchId) filter.batchId = batchId;
  if (search) {
    filter.$or = [
      { recipientMobile: { $regex: search, $options: 'i' } },
      { recipientName: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const [messages, total] = await Promise.all([
    WhatsAppMessage.find(filter)
      .populate('templateId', 'name title')
      .populate('recipientId', 'name memberId memberType')
      .populate('sentBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WhatsAppMessage.countDocuments(filter)
  ]);

  return {
    data: messages,
    pagination: createPaginationResponse(total, page, limit)
  };
};

/**
 * Get message statistics
 */
const getMessageStatistics = async (query = {}) => {
  const { startDate, endDate } = query;
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const [
    totalMessages,
    sentMessages,
    failedMessages,
    pendingMessages,
    totalCost,
    totalRecipients
  ] = await Promise.all([
    WhatsAppMessage.countDocuments(dateFilter),
    WhatsAppMessage.countDocuments({ ...dateFilter, status: 'sent' }),
    WhatsAppMessage.countDocuments({ ...dateFilter, status: 'failed' }),
    WhatsAppMessage.countDocuments({ ...dateFilter, status: 'pending' }),
    WhatsAppMessage.aggregate([
      { $match: { ...dateFilter, status: 'sent' } },
      { $group: { _id: null, total: { $sum: '$msgCost' } } }
    ]),
    WhatsAppMessage.distinct('recipientMobile', dateFilter)
  ]);

  return {
    totalMessages,
    sentMessages,
    failedMessages,
    pendingMessages,
    totalCost: totalCost[0]?.total || 0,
    totalRecipients: totalRecipients.length
  };
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
  getMessageStatistics,
  replaceTemplateVariables
};
