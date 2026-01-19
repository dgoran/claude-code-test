const mongoose = require('mongoose');

const registrantSchema = new mongoose.Schema({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  jobTitle: {
    type: String,
    default: ''
  },
  customFields: {
    type: Map,
    of: String,
    default: {}
  },
  zoomRegistrantId: {
    type: String,
    default: ''
  },
  zoomJoinUrl: {
    type: String,
    default: ''
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  syncedToZoom: {
    type: Boolean,
    default: false
  },
  syncError: {
    type: String,
    default: ''
  }
});

// Compound index to prevent duplicate registrations
registrantSchema.index({ meetingId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registrant', registrantSchema);
