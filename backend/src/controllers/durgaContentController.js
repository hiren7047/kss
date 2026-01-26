const durgaContentService = require('../services/durgaContentService');

const createDurgaContent = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const durgaContent = await durgaContentService.createDurgaContent(
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(201).json({
      success: true,
      message: 'Durga content created successfully',
      data: durgaContent
    });
  } catch (error) {
    next(error);
  }
};

const getDurgaContents = async (req, res, next) => {
  try {
    const result = await durgaContentService.getDurgaContents(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getDurgaContent = async (req, res, next) => {
  try {
    const { durgaId } = req.params;
    const durgaContent = await durgaContentService.getDurgaContent(durgaId);
    res.status(200).json({
      success: true,
      data: durgaContent
    });
  } catch (error) {
    next(error);
  }
};

const updateDurgaContent = async (req, res, next) => {
  try {
    const { durgaId } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const durgaContent = await durgaContentService.updateDurgaContent(
      durgaId,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Durga content updated successfully',
      data: durgaContent
    });
  } catch (error) {
    next(error);
  }
};

const deleteDurgaContent = async (req, res, next) => {
  try {
    const { durgaId } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await durgaContentService.deleteDurgaContent(durgaId, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Durga content deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDurgaContent,
  getDurgaContents,
  getDurgaContent,
  updateDurgaContent,
  deleteDurgaContent
};
