const volunteerService = require('../services/volunteerService');

/**
 * Assign volunteer to event
 */
const assignVolunteer = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const assignment = await volunteerService.assignVolunteer(req.body, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Volunteer assigned successfully',
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all volunteer assignments
 */
const getAllAssignments = async (req, res, next) => {
  try {
    const result = await volunteerService.getAllAssignments(req.query);

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
 * Get volunteers by event
 */
const getVolunteersByEvent = async (req, res, next) => {
  try {
    const volunteers = await volunteerService.getVolunteersByEvent(req.params.id);

    res.status(200).json({
      success: true,
      data: volunteers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get assignments by volunteer
 */
const getAssignmentsByVolunteer = async (req, res, next) => {
  try {
    const assignments = await volunteerService.getAssignmentsByVolunteer(req.params.id);

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update volunteer attendance
 */
const updateAttendance = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const assignment = await volunteerService.updateAttendance(
      req.params.id,
      req.body,
      req.user._id,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove volunteer from event
 */
const removeVolunteer = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await volunteerService.removeVolunteer(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Volunteer removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignVolunteer,
  getAllAssignments,
  getVolunteersByEvent,
  getAssignmentsByVolunteer,
  updateAttendance,
  removeVolunteer
};


