const mongoose = require('mongoose');

const volunteerPointsSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Volunteer ID is required'],
    index: true
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  verifiedPoints: {
    type: Number,
    default: 0,
    min: [0, 'Verified points cannot be negative']
  },
  pendingPoints: {
    type: Number,
    default: 0,
    min: [0, 'Pending points cannot be negative']
  },
  lastVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastVerifiedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
volunteerPointsSchema.index({ volunteerId: 1 });
volunteerPointsSchema.index({ points: -1 }); // For leaderboard sorting
volunteerPointsSchema.index({ verifiedPoints: -1 }); // For verified leaderboard

// Ensure one document per volunteer
volunteerPointsSchema.index({ volunteerId: 1 }, { unique: true });

module.exports = mongoose.model('VolunteerPoints', volunteerPointsSchema);
