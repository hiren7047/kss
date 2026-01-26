const memberService = require('../services/memberService');

/**
 * Create member
 */
const createMember = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const member = await memberService.createMember(req.body, req.user._id, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: member
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all members
 */
const getMembers = async (req, res, next) => {
  try {
    const result = await memberService.getMembers(req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get member by ID
 */
const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id);

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update member
 */
const updateMember = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const member = await memberService.updateMember(req.params.id, req.body, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: member
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete member (soft delete)
 */
const deleteMember = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await memberService.deleteMember(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve pending member registration
 */
const approveMember = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const member = await memberService.approveMember(req.params.id, req.user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Member registration approved successfully',
      data: member
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject pending member registration
 */
const rejectMember = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { reason } = req.body;
    const member = await memberService.rejectMember(req.params.id, req.user._id, reason, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Member registration rejected',
      data: member
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  approveMember,
  rejectMember
};


