const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');
const { ownerAuth, requireOwnerRole } = require('../middleware/ownerAuth');

// Generate JWT token
const generateToken = (ownerId) => {
  return jwt.sign(
    { ownerId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @route   POST /api/owners/register
// @desc    Register a new owner (restricted - should be done via manual process)
// @access  Public (but in production, this should be protected)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, secretKey } = req.body;

    // In production, require a secret key to create owners
    if (process.env.NODE_ENV === 'production' && secretKey !== process.env.OWNER_REGISTRATION_SECRET) {
      return res.status(403).json({ message: 'Unauthorized to create owner accounts' });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if owner already exists
    const existingOwner = await Owner.findOne({ email: email.toLowerCase() });
    if (existingOwner) {
      return res.status(400).json({ message: 'Owner with this email already exists' });
    }

    // Create new owner
    const owner = new Owner({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'admin'
    });

    await owner.save();

    // Generate token
    const token = generateToken(owner._id);

    res.status(201).json({
      message: 'Owner registered successfully',
      token,
      owner: owner.toJSON()
    });
  } catch (error) {
    console.error('Owner registration error:', error);
    res.status(500).json({ message: 'Error registering owner', error: error.message });
  }
});

// @route   POST /api/owners/login
// @desc    Login owner
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find owner
    const owner = await Owner.findOne({ email: email.toLowerCase() });
    if (!owner) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if owner is active
    if (!owner.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await owner.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    owner.lastLogin = new Date();
    await owner.save();

    // Generate token
    const token = generateToken(owner._id);

    res.json({
      message: 'Login successful',
      token,
      owner: owner.toJSON()
    });
  } catch (error) {
    console.error('Owner login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// @route   GET /api/owners/profile
// @desc    Get owner profile
// @access  Private (Owner)
router.get('/profile', ownerAuth, async (req, res) => {
  try {
    res.json({ owner: req.owner.toJSON() });
  } catch (error) {
    console.error('Get owner profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// @route   PUT /api/owners/profile
// @desc    Update owner profile
// @access  Private (Owner)
router.put('/profile', ownerAuth, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (email && email !== req.owner.email) {
      // Check if new email is already taken
      const existingOwner = await Owner.findOne({ email: email.toLowerCase(), _id: { $ne: req.owner._id } });
      if (existingOwner) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      req.owner.email = email.toLowerCase();
    }

    if (name) {
      req.owner.name = name;
    }

    await req.owner.save();

    res.json({
      message: 'Profile updated successfully',
      owner: req.owner.toJSON()
    });
  } catch (error) {
    console.error('Update owner profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// @route   PUT /api/owners/password
// @desc    Change owner password
// @access  Private (Owner)
router.put('/password', ownerAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    // Verify current password
    const isMatch = await req.owner.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.owner.password = newPassword;
    await req.owner.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

module.exports = router;
