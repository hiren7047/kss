const testimonialService = require('../services/testimonialService');

const createTestimonial = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const testimonial = await testimonialService.createTestimonial(
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

const getTestimonials = async (req, res, next) => {
  try {
    const result = await testimonialService.getTestimonials(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testimonial = await testimonialService.getTestimonial(id);
    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const testimonial = await testimonialService.updateTestimonial(
      id,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

const approveTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const testimonial = await testimonialService.approveTestimonial(
      id,
      req.body.isActive,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: `Testimonial ${req.body.isActive ? 'approved' : 'rejected'} successfully`,
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await testimonialService.deleteTestimonial(id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTestimonial,
  getTestimonials,
  getTestimonial,
  updateTestimonial,
  approveTestimonial,
  deleteTestimonial
};
