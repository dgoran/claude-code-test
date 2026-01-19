const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');

const ownerAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if this is an owner token (not organization token)
    if (!decoded.ownerId) {
      return res.status(403).json({ message: 'Access denied. Owner privileges required.' });
    }

    // Find owner
    const owner = await Owner.findById(decoded.ownerId);

    if (!owner) {
      return res.status(401).json({ message: 'Owner not found' });
    }

    if (!owner.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Attach owner to request
    req.owner = owner;
    req.ownerId = owner._id;

    next();
  } catch (error) {
    console.error('Owner auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Middleware to check if owner has 'owner' role (not just 'admin')
const requireOwnerRole = (req, res, next) => {
  if (req.owner && req.owner.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Owner role required.' });
  }
};

module.exports = { ownerAuth, requireOwnerRole };
