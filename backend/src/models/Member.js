const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  // Name fields
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  middleName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  // Full name (computed)
  name: {
    type: String,
    required: false, // Will be set by pre-save hook or service
    trim: true
  },
  // Personal information
  dateOfBirth: {
    type: Date
  },
  age: {
    type: Number,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    trim: true
  },
  // Parents information
  parentsName: {
    type: String,
    trim: true
  },
  fatherBusiness: {
    type: String,
    trim: true
  },
  motherBusiness: {
    type: String,
    trim: true
  },
  // Contact information
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  whatsappNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit WhatsApp number']
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    number: {
      type: String,
      trim: true
    },
    relation: {
      type: String,
      trim: true
    }
  },
  // Address information
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    }
  },
  // Identification
  aadharNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{12}$/, 'Please provide a valid 12-digit Aadhar number']
  },
  idProofType: {
    type: String,
    trim: true,
    default: 'Aadhaar',
    enum: ['Aadhaar', 'Passport', 'PAN', 'Driving License', 'Voter ID', 'Other']
  },
  photo: {
    type: String,
    default: null
  },
  idProof: {
    type: String,
    default: null
  },
  // Professional information
  occupation: {
    type: String,
    trim: true
  },
  business: {
    type: String,
    trim: true
  },
  educationDetails: {
    type: String,
    trim: true
  },
  // Family information
  familyMembersCount: {
    type: Number,
    default: 1,
    min: 1
  },
  // Volunteer specific fields
  interests: {
    type: [String],
    default: []
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'event-based'],
    trim: true
  },
  // Member type and status
  memberType: {
    type: String,
    enum: ['donor', 'volunteer', 'beneficiary', 'core'],
    required: [true, 'Member type is required']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'rejected'],
    default: 'active'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  // Registration form and ID card
  registrationFormUrl: {
    type: String,
    default: null
  },
  idCardUrl: {
    type: String,
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  // Volunteer login credentials (only for volunteers)
  registrationId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
    trim: true,
    index: true
  },
  password: {
    type: String,
    trim: true,
    select: false // Don't include in queries by default
  },
  softDelete: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Generate full name before saving
memberSchema.pre('save', function(next) {
  const parts = [this.firstName];
  if (this.middleName) parts.push(this.middleName);
  parts.push(this.lastName);
  this.name = parts.join(' ').trim();
  next();
});

// Hash password before saving (only for volunteers)
memberSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  // Only hash password if member is a volunteer
  if (this.memberType === 'volunteer' && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Compare password method (for volunteers)
memberSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for efficient queries
memberSchema.index({ memberId: 1, softDelete: 1 });
memberSchema.index({ memberType: 1, softDelete: 1 });
memberSchema.index({ status: 1, softDelete: 1 });
memberSchema.index({ aadharNumber: 1, softDelete: 1 });

module.exports = mongoose.model('Member', memberSchema);
