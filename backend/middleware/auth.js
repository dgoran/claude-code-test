const jwt = require('jsonwebtoken');
const Organization = require('../models/Organization');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const organization = await Organization.findById(decoded.id);

    if (!organization) {
      return res.status(401).json({ error: 'Organization not found' });
    }

    req.organization = organization;
    req.organizationId = organization._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

module.exports = authMiddleware;
