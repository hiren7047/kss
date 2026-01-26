const mongoose = require('mongoose');

const volunteerAssignmentSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Volunteer ID is required']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  role: {
    type: String,
    trim: true,
    default: 'volunteer'
  },
  attendance: {
    type: String,
    enum: ['present', 'absent', 'pending'],
    default: 'pending'
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
volunteerAssignmentSchema.index({ volunteerId: 1, eventId: 1 });
volunteerAssignmentSchema.index({ eventId: 1 });

module.exports = mongoose.model('VolunteerAssignment', volunteerAssignmentSchema);


