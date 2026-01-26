const mongoose = require('mongoose');

const volunteerRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 1,
    max: 150
  },
  occupation: {
    type: String,
    trim: true
  },
  interests: [{
    type: String,
    trim: true
  }],
  aboutYou: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  },
  softDelete: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
volunteerRegistrationSchema.index({ status: 1, softDelete: 1 });
volunteerRegistrationSchema.index({ createdAt: -1 });
volunteerRegistrationSchema.index({ phone: 1 });

module.exports = mongoose.model('VolunteerRegistration', volunteerRegistrationSchema);
