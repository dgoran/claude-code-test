const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  meetingName: {
    type: String,
    required: true,
    trim: true
  },
  meetingType: {
    type: String,
    enum: ['webinar', 'meeting'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  zoomMeetingId: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  landingPageTitle: {
    type: String,
    default: ''
  },
  landingPageDescription: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meeting', meetingSchema);
