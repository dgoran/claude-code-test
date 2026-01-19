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
  formFields: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldLabel: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'email', 'tel', 'textarea', 'select'],
      default: 'text'
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    isStandardZoomField: {
      type: Boolean,
      default: false
    },
    zoomFieldKey: {
      type: String,
      default: ''
    },
    options: [{
      type: String
    }],
    order: {
      type: Number,
      default: 0
    }
  }],
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
