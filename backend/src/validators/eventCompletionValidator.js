const Joi = require('joi');

const completeEventSchema = Joi.object({
  defaultPointsForPresent: Joi.number().min(0).default(10),
  defaultPointsForAbsent: Joi.number().min(0).default(0),
  defaultPointsForPending: Joi.number().min(0).default(5),
  volunteerPoints: Joi.array().items(
    Joi.object({
      volunteerId: Joi.string().hex().length(24).required(),
      points: Joi.number().min(0).required(),
      notes: Joi.string().trim().allow('', null).optional()
    })
  ).optional()
});

module.exports = {
  completeEventSchema
};
