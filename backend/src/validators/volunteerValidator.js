const Joi = require('joi');

const assignVolunteerSchema = Joi.object({
  volunteerId: Joi.string().hex().length(24).required(),
  eventId: Joi.string().hex().length(24).required(),
  role: Joi.string().trim().optional(),
  remarks: Joi.string().trim().allow('', null).optional()
});

const updateAttendanceSchema = Joi.object({
  attendance: Joi.string().valid('present', 'absent', 'pending').required(),
  remarks: Joi.string().trim().allow('', null).optional()
});

module.exports = {
  assignVolunteerSchema,
  updateAttendanceSchema
};


