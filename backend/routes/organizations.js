const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('../models/Organization');
const authMiddleware = require('../middleware/auth');

// Register a new organization
router.post('/register', async (req, res) => {
  try {
    const { organizationName, email, password, meetingName } = req.body;

    // Validate input
    if (!organizationName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ email: email.toLowerCase() });
    if (existingOrg) {
      return res.status(400).json({ error: 'Organization with this email already exists' });
    }

    // Generate subdomain from organization name
    let subdomain = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure subdomain is unique
    let subdomainExists = await Organization.findOne({ subdomain });
    let counter = 1;
    while (subdomainExists) {
      subdomain = `${subdomain}-${counter}`;
      subdomainExists = await Organization.findOne({ subdomain });
      counter++;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization
    const organization = new Organization({
      organizationName,
      email: email.toLowerCase(),
      password: hashedPassword,
      subdomain
    });

    await organization.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: organization._id, email: organization.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Organization registered successfully',
      token,
      organization: {
        id: organization._id,
        organizationName: organization.organizationName,
        email: organization.email,
        subdomain: organization.subdomain
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      error: 'Failed to register organization',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find organization
    const organization = await Organization.findOne({ email: email.toLowerCase() });
    if (!organization) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, organization.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: organization._id, email: organization.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      organization: {
        id: organization._id,
        organizationName: organization.organizationName,
        email: organization.email,
        subdomain: organization.subdomain,
        hasZoomCredentials: !!(organization.zoomClientId && organization.zoomClientSecret && organization.zoomAccountId)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      error: 'Failed to login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get organization profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      organization: {
        id: req.organization._id,
        organizationName: req.organization.organizationName,
        email: req.organization.email,
        subdomain: req.organization.subdomain,
        hasZoomCredentials: !!(req.organization.zoomClientId && req.organization.zoomClientSecret && req.organization.zoomAccountId),
        createdAt: req.organization.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update Zoom API credentials
router.put('/zoom-credentials', authMiddleware, async (req, res) => {
  try {
    const { zoomAccountId, zoomClientId, zoomClientSecret } = req.body;

    if (!zoomAccountId || !zoomClientId || !zoomClientSecret) {
      return res.status(400).json({ error: 'Please provide all Zoom credentials' });
    }

    req.organization.zoomAccountId = zoomAccountId;
    req.organization.zoomClientId = zoomClientId;
    req.organization.zoomClientSecret = zoomClientSecret;

    await req.organization.save();

    res.json({
      message: 'Zoom credentials updated successfully',
      hasZoomCredentials: true
    });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ error: 'Failed to update Zoom credentials' });
  }
});

// Get organization by subdomain (public route)
router.get('/subdomain/:subdomain', async (req, res) => {
  try {
    const organization = await Organization.findOne({
      subdomain: req.params.subdomain,
      isActive: true
    }).select('organizationName subdomain');

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ organization });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to get organization' });
  }
});

module.exports = router;
