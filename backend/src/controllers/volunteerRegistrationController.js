const volunteerRegistrationService = require('../services/volunteerRegistrationService');

const createVolunteerRegistration = async (req, res, next) => {
  try {
    const registration = await volunteerRegistrationService.createVolunteerRegistration(req.body);
    res.status(201).json({
      success: true,
      message: 'Volunteer registration received successfully',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

const getVolunteerRegistrations = async (req, res, next) => {
  try {
    const result = await volunteerRegistrationService.getVolunteerRegistrations(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getVolunteerRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registration = await volunteerRegistrationService.getVolunteerRegistration(id);
    res.status(200).json({
      success: true,
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

const updateVolunteerRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const registration = await volunteerRegistrationService.updateVolunteerRegistration(
      id,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Volunteer registration updated successfully',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

const deleteVolunteerRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await volunteerRegistrationService.deleteVolunteerRegistration(id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Volunteer registration deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVolunteerRegistration,
  getVolunteerRegistrations,
  getVolunteerRegistration,
  updateVolunteerRegistration,
  deleteVolunteerRegistration
};
