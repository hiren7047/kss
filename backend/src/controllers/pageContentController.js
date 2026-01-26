const pageContentService = require('../services/pageContentService');

const createPageContent = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const pageContent = await pageContentService.createPageContent(
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(201).json({
      success: true,
      message: 'Page content created successfully',
      data: pageContent
    });
  } catch (error) {
    next(error);
  }
};

const getPageContents = async (req, res, next) => {
  try {
    const result = await pageContentService.getPageContents(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getPageContent = async (req, res, next) => {
  try {
    const { pageId, language } = req.params;
    const pageContent = await pageContentService.getPageContent(pageId, language);
    res.status(200).json({
      success: true,
      data: pageContent
    });
  } catch (error) {
    next(error);
  }
};

const updatePageContent = async (req, res, next) => {
  try {
    const { pageId, language } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const pageContent = await pageContentService.updatePageContent(
      pageId,
      language,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Page content updated successfully',
      data: pageContent
    });
  } catch (error) {
    next(error);
  }
};

const publishPageContent = async (req, res, next) => {
  try {
    const { pageId, language } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const pageContent = await pageContentService.publishPageContent(
      pageId,
      language,
      req.user._id,
      ipAddress,
      req.body.changeReason
    );

    res.status(200).json({
      success: true,
      message: 'Page content published successfully',
      data: pageContent
    });
  } catch (error) {
    next(error);
  }
};

const deletePageContent = async (req, res, next) => {
  try {
    const { pageId, language } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await pageContentService.deletePageContent(pageId, language, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Page content deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getVersionHistory = async (req, res, next) => {
  try {
    const { pageId, language } = req.params;
    const versions = await pageContentService.getVersionHistory(pageId, language);

    res.status(200).json({
      success: true,
      data: versions
    });
  } catch (error) {
    next(error);
  }
};

const revertToVersion = async (req, res, next) => {
  try {
    const { pageId, language } = req.params;
    const { version } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const pageContent = await pageContentService.revertToVersion(
      pageId,
      language,
      version,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Page content reverted successfully',
      data: pageContent
    });
  } catch (error) {
    next(error);
  }
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
