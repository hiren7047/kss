const Joi = require('joi');

const createMemberSchema = Joi.object({
  // Name fields
  firstName: Joi.string().trim().required(),
  middleName: Joi.string().trim().allow('', null).optional(),
  lastName: Joi.string().trim().required(),
  // Personal information
  dateOfBirth: Joi.date().allow('', null).optional(),
  age: Joi.alternatives().try(Joi.number().integer().min(0).max(150), Joi.string()).allow('', null).optional(),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null).optional(),
  // Parents information
  parentsName: Joi.string().trim().allow('', null).optional(),
  fatherBusiness: Joi.string().trim().allow('', null).optional(),
  motherBusiness: Joi.string().trim().allow('', null).optional(),
  // Contact information
  email: Joi.string().email().allow('', null).optional(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  whatsappNumber: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().allow('', null).optional(),
    number: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional(),
    relation: Joi.string().trim().allow('', null).optional()
  }).optional(),
  // Address information
  address: Joi.object({
    street: Joi.string().trim().allow('', null).optional(),
    city: Joi.string().trim().allow('', null).optional(),
    state: Joi.string().trim().allow('', null).optional(),
    country: Joi.string().trim().allow('', null).optional(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).allow('', null).optional()
  }).optional(),
  // Identification
  aadharNumber: Joi.string().pattern(/^[0-9]{12}$/).allow('', null).optional(),
  idProofType: Joi.string().valid('Aadhaar', 'Passport', 'PAN', 'Driving License', 'Voter ID', 'Other').allow('', null).optional(),
  photo: Joi.string().allow('', null).optional(),
  idProof: Joi.string().allow('', null).optional(),
  // Professional information
  occupation: Joi.string().trim().allow('', null).optional(),
  business: Joi.string().trim().allow('', null).optional(),
  educationDetails: Joi.string().trim().allow('', null).optional(),
  // Family information
  familyMembersCount: Joi.number().integer().min(1).optional(),
  // Volunteer specific
  interests: Joi.array().items(Joi.string()).allow(null).optional(),
  availability: Joi.string().valid('full-time', 'part-time', 'event-based').allow('', null).optional(),
  // Member type and status
  memberType: Joi.string().valid('donor', 'volunteer', 'beneficiary', 'core').required(),
  joinDate: Joi.date().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  notes: Joi.string().trim().allow('', null).optional(),
  signature: Joi.string().allow('', null).optional()
});

const updateMemberSchema = Joi.object({
  firstName: Joi.string().trim().optional(),
  middleName: Joi.string().trim().allow('', null).optional(),
  lastName: Joi.string().trim().optional(),
  dateOfBirth: Joi.date().allow('', null).optional(),
  age: Joi.alternatives().try(Joi.number().integer().min(0).max(150), Joi.string()).allow('', null).optional(),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null).optional(),
  parentsName: Joi.string().trim().allow('', null).optional(),
  fatherBusiness: Joi.string().trim().allow('', null).optional(),
  motherBusiness: Joi.string().trim().allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  whatsappNumber: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().allow('', null).optional(),
    number: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional(),
    relation: Joi.string().trim().allow('', null).optional()
  }).optional(),
  address: Joi.object({
    street: Joi.string().trim().allow('', null).optional(),
    city: Joi.string().trim().allow('', null).optional(),
    state: Joi.string().trim().allow('', null).optional(),
    country: Joi.string().trim().allow('', null).optional(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).allow('', null).optional()
  }).optional(),
  aadharNumber: Joi.string().pattern(/^[0-9]{12}$/).allow('', null).optional(),
  idProofType: Joi.string().valid('Aadhaar', 'Passport', 'PAN', 'Driving License', 'Voter ID', 'Other').allow('', null).optional(),
  photo: Joi.string().allow('', null).optional(),
  idProof: Joi.string().allow('', null).optional(),
  occupation: Joi.string().trim().allow('', null).optional(),
  business: Joi.string().trim().allow('', null).optional(),
  educationDetails: Joi.string().trim().allow('', null).optional(),
  familyMembersCount: Joi.number().integer().min(1).optional(),
  interests: Joi.array().items(Joi.string()).allow(null).optional(),
  availability: Joi.string().valid('full-time', 'part-time', 'event-based').allow('', null).optional(),
  memberType: Joi.string().valid('donor', 'volunteer', 'beneficiary', 'core').optional(),
  joinDate: Joi.date().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  notes: Joi.string().trim().allow('', null).optional(),
  signature: Joi.string().allow('', null).optional()
});

module.exports = {
  createMemberSchema,
  updateMemberSchema
};
