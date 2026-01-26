const contactSubmissionService = require('../services/contactSubmissionService');

const createContactSubmission = async (req, res, next) => {
  try {
    const submission = await contactSubmissionService.createContactSubmission(req.body);
    res.status(201).json({
      success: true,
      message: 'Contact submission received successfully',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

const getContactSubmissions = async (req, res, next) => {
  try {
    const result = await contactSubmissionService.getContactSubmissions(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getContactSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await contactSubmissionService.getContactSubmission(id);
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

const updateContactSubmissionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const submission = await contactSubmissionService.updateContactSubmissionStatus(
      id,
      req.body.status,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Contact submission status updated successfully',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

const replyToSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const submission = await contactSubmissionService.replyToSubmission(
      id,
      req.body.replyMessage,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

const deleteContactSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await contactSubmissionService.deleteContactSubmission(id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactSubmission,
  getContactSubmissions,
  getContactSubmission,
  updateContactSubmissionStatus,
  replyToSubmission,
  deleteContactSubmission
};
