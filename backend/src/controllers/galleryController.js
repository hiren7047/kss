const galleryService = require('../services/galleryService');

const createGalleryItem = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const galleryItem = await galleryService.createGalleryItem(
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

const getGalleryItems = async (req, res, next) => {
  try {
    const result = await galleryService.getGalleryItems(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const galleryItem = await galleryService.getGalleryItem(id);
    res.status(200).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const galleryItem = await galleryService.updateGalleryItem(
      id,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await galleryService.deleteGalleryItem(id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGalleryItem,
  getGalleryItems,
  getGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
