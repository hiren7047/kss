const EmailTemplate = require('../models/EmailTemplate');

const createEmailTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

const getEmailTemplates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { softDelete: false };

    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      const search = req.query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const [templates, total] = await Promise.all([
      EmailTemplate.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      EmailTemplate.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      data: templates,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEmailTemplateById = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findOne({
      _id: req.params.id,
      softDelete: false,
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmailTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findOne({
      _id: req.params.id,
      softDelete: false,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    Object.assign(template, req.body);
    template.updatedBy = req.user._id;
    await template.save();

    res.status(200).json({
      success: true,
      message: 'Email template updated successfully',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmailTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findOne({
      _id: req.params.id,
      softDelete: false,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    template.softDelete = true;
    template.updatedBy = req.user._id;
    await template.save();

    res.status(200).json({
      success: true,
      message: 'Email template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmailTemplate,
  getEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
};

