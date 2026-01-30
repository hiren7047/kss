const Joi = require('joi');

const reviewWorkSubmissionSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  pointsAwarded: Joi.number().min(0).when('status', {
    is: 'approved',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  reviewNotes: Joi.string().trim().allow('', null).optional(),
  rejectionReason: Joi.string().trim().when('status', {
    is: 'rejected',
    then: Joi.optional(),
    otherwise: Joi.allow('', null).optional()
  })
});

const verifyPointsSchema = Joi.object({
  volunteerId: Joi.string().hex().length(24).required(),
  pointsToVerify: Joi.number().positive().required()
});

module.exports = {
  reviewWorkSubmissionSchema,
  verifyPointsSchema
};
