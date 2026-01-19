const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  subdomain: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  zoomApiKey: {
    type: String,
    default: ''
  },
  zoomApiSecret: {
    type: String,
    default: ''
  },
  zoomAccountId: {
    type: String,
    default: ''
  },
  zoomClientId: {
    type: String,
    default: ''
  },
  zoomClientSecret: {
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

module.exports = mongoose.model('Organization', organizationSchema);
