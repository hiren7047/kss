const mongoose = require('mongoose');

const volunteerWorkSubmissionSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Volunteer ID is required'],
    index: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
    index: true
  },
  workTitle: {
    type: String,
    required: [true, 'Work title is required'],
    trim: true
  },
  workDescription: {
    type: String,
    required: [true, 'Work description is required'],
    trim: true
  },
  workType: {
    type: String,
    enum: ['attendance', 'task_completion', 'event_organization', 'other'],
    default: 'task_completion'
  },
  attachments: [{
    type: String, // URLs to uploaded files
  }],
  pointsAwarded: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected'],
    default: 'submitted'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
volunteerWorkSubmissionSchema.index({ volunteerId: 1, createdAt: -1 });
volunteerWorkSubmissionSchema.index({ eventId: 1, createdAt: -1 });
volunteerWorkSubmissionSchema.index({ status: 1, createdAt: -1 });
volunteerWorkSubmissionSchema.index({ volunteerId: 1, eventId: 1 });

module.exports = mongoose.model('VolunteerWorkSubmission', volunteerWorkSubmissionSchema);
