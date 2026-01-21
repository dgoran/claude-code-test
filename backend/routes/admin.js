const express = require('express');
const router = express.Router();
const { ownerAuth } = require('../middleware/ownerAuth');
const Organization = require('../models/Organization');
const Meeting = require('../models/Meeting');
const Registrant = require('../models/Registrant');

// @route   GET /api/admin/organizations
// @desc    Get all organizations with statistics
// @access  Private (Owner)
router.get('/organizations', ownerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { organizationName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subdomain: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Build aggregation pipeline to get organizations with stats in a single query
    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'meetings',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'meetings'
        }
      },
      {
        $lookup: {
          from: 'registrants',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'registrants'
        }
      },
      {
        $addFields: {
          'stats.meetings': { $size: '$meetings' },
          'stats.registrants': { $size: '$registrants' },
          'stats.syncedToZoom': {
            $size: {
              $filter: {
                input: '$registrants',
                as: 'reg',
                cond: { $eq: ['$$reg.syncedToZoom', true] }
              }
            }
          },
          'stats.hasZoomCredentials': {
            $and: [
              { $ne: ['$zoomClientId', null] },
              { $ne: ['$zoomClientSecret', null] },
              { $ne: ['$zoomAccountId', null] }
            ]
          }
        }
      },
      {
        $project: {
          password: 0,
          meetings: 0,
          registrants: 0
        }
      },
      { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ];

    const orgsWithStats = await Organization.aggregate(aggregationPipeline);

    // Get total count
    const total = await Organization.countDocuments(filter);

    res.json({
      organizations: orgsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ message: 'Error fetching organizations', error: error.message });
  }
});

// @route   GET /api/admin/organizations/:id
// @desc    Get organization details
// @access  Private (Owner)
router.get('/organizations/:id', ownerAuth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).select('-password').lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Get detailed statistics
    const [
      meetings,
      totalRegistrants,
      syncedRegistrants,
      recentMeetings,
      recentRegistrants
    ] = await Promise.all([
      Meeting.find({ organizationId: organization._id }).lean(),
      Registrant.countDocuments({ organizationId: organization._id }),
      Registrant.countDocuments({ organizationId: organization._id, syncedToZoom: true }),
      Meeting.find({ organizationId: organization._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Registrant.find({ organizationId: organization._id })
        .sort({ registeredAt: -1 })
        .limit(10)
        .populate('meetingId', 'meetingName')
        .lean()
    ]);

    // Calculate registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrend = await Registrant.aggregate([
      {
        $match: {
          organizationId: organization._id,
          registeredAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$registeredAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      organization,
      stats: {
        meetings: meetings.length,
        activeMeetings: meetings.filter(m => m.isActive).length,
        totalRegistrants,
        syncedToZoom: syncedRegistrants,
        syncRate: totalRegistrants > 0 ? ((syncedRegistrants / totalRegistrants) * 100).toFixed(1) : 0,
        hasZoomCredentials: !!(organization.zoomClientId && organization.zoomClientSecret && organization.zoomAccountId)
      },
      recentMeetings,
      recentRegistrants,
      registrationTrend
    });
  } catch (error) {
    console.error('Get organization details error:', error);
    res.status(500).json({ message: 'Error fetching organization details', error: error.message });
  }
});

// @route   PUT /api/admin/organizations/:id
// @desc    Update organization (e.g., activate/deactivate)
// @access  Private (Owner)
router.put('/organizations/:id', ownerAuth, async (req, res) => {
  try {
    const { isActive, organizationName, email } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update fields
    if (typeof isActive !== 'undefined') {
      organization.isActive = isActive;
    }
    if (organizationName) {
      organization.organizationName = organizationName;
    }
    if (email) {
      // Check if email is already taken
      const existingOrg = await Organization.findOne({ email, _id: { $ne: organization._id } });
      if (existingOrg) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      organization.email = email;
    }

    await organization.save();

    res.json({
      message: 'Organization updated successfully',
      organization: organization.toJSON()
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ message: 'Error updating organization', error: error.message });
  }
});

// @route   DELETE /api/admin/organizations/:id
// @desc    Delete organization and all related data
// @access  Private (Owner)
router.delete('/organizations/:id', ownerAuth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Delete all related data
    await Promise.all([
      Meeting.deleteMany({ organizationId: organization._id }),
      Registrant.deleteMany({ organizationId: organization._id }),
      Organization.findByIdAndDelete(organization._id)
    ]);

    res.json({ message: 'Organization and all related data deleted successfully' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ message: 'Error deleting organization', error: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get overall system statistics
// @access  Private (Owner)
router.get('/stats', ownerAuth, async (req, res) => {
  try {
    const [
      totalOrganizations,
      activeOrganizations,
      totalMeetings,
      activeMeetings,
      totalRegistrants,
      syncedRegistrants,
      recentOrganizations
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ isActive: true }),
      Meeting.countDocuments(),
      Meeting.countDocuments({ isActive: true }),
      Registrant.countDocuments(),
      Registrant.countDocuments({ syncedToZoom: true }),
      Organization.find().select('-password').sort({ createdAt: -1 }).limit(5).lean()
    ]);

    // Get registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrend = await Registrant.aggregate([
      {
        $match: {
          registeredAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$registeredAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get organizations created trend (last 30 days)
    const orgCreationTrend = await Organization.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top organizations by registrants
    const topOrganizations = await Registrant.aggregate([
      {
        $group: {
          _id: '$organizationId',
          registrants: { $sum: 1 }
        }
      },
      { $sort: { registrants: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'organizations',
          localField: '_id',
          foreignField: '_id',
          as: 'organization'
        }
      },
      { $unwind: '$organization' },
      {
        $project: {
          organizationName: '$organization.organizationName',
          subdomain: '$organization.subdomain',
          registrants: 1
        }
      }
    ]);

    res.json({
      summary: {
        organizations: {
          total: totalOrganizations,
          active: activeOrganizations,
          inactive: totalOrganizations - activeOrganizations
        },
        meetings: {
          total: totalMeetings,
          active: activeMeetings
        },
        registrants: {
          total: totalRegistrants,
          syncedToZoom: syncedRegistrants,
          syncRate: totalRegistrants > 0 ? ((syncedRegistrants / totalRegistrants) * 100).toFixed(1) : 0
        }
      },
      trends: {
        registrations: registrationTrend,
        organizations: orgCreationTrend
      },
      topOrganizations,
      recentOrganizations
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// @route   GET /api/admin/registrants
// @desc    Get all registrants across all organizations
// @access  Private (Owner)
router.get('/registrants', ownerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', organizationId = '' } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    // Get registrants
    const registrants = await Registrant.find(filter)
      .populate('meetingId', 'meetingName')
      .populate('organizationId', 'organizationName subdomain')
      .sort({ registeredAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get total count
    const total = await Registrant.countDocuments(filter);

    res.json({
      registrants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get registrants error:', error);
    res.status(500).json({ message: 'Error fetching registrants', error: error.message });
  }
});

// @route   GET /api/admin/meetings
// @desc    Get all meetings across all organizations
// @access  Private (Owner)
router.get('/meetings', ownerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', organizationId = '' } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.meetingName = { $regex: search, $options: 'i' };
    }
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    // Use aggregation to get meetings with registrant counts in a single query
    const meetingsWithCounts = await Meeting.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'registrants',
          localField: '_id',
          foreignField: 'meetingId',
          as: 'registrants'
        }
      },
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization'
        }
      },
      { $unwind: { path: '$organization', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          registrantCount: { $size: '$registrants' },
          organizationId: {
            _id: '$organization._id',
            organizationName: '$organization.organizationName',
            subdomain: '$organization.subdomain'
          }
        }
      },
      {
        $project: {
          registrants: 0,
          organization: 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    // Get total count
    const total = await Meeting.countDocuments(filter);

    res.json({
      meetings: meetingsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
});

// @route   DELETE /api/admin/meetings/:id
// @desc    Delete meeting and all related registrants
// @access  Private (Owner)
router.delete('/meetings/:id', ownerAuth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Delete meeting and all related registrants
    await Promise.all([
      Registrant.deleteMany({ meetingId: meeting._id }),
      Meeting.findByIdAndDelete(meeting._id)
    ]);

    res.json({ message: 'Meeting and all related registrants deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Error deleting meeting', error: error.message });
  }
});

// @route   DELETE /api/admin/registrants/:id
// @desc    Delete registrant
// @access  Private (Owner)
router.delete('/registrants/:id', ownerAuth, async (req, res) => {
  try {
    const registrant = await Registrant.findById(req.params.id);

    if (!registrant) {
      return res.status(404).json({ message: 'Registrant not found' });
    }

    await Registrant.findByIdAndDelete(registrant._id);

    res.json({ message: 'Registrant deleted successfully' });
  } catch (error) {
    console.error('Delete registrant error:', error);
    res.status(500).json({ message: 'Error deleting registrant', error: error.message });
  }
});

// @route   GET /api/admin/organizations/:id/zoom-credentials
// @desc    Get Zoom credentials for an organization
// @access  Private (Owner)
router.get('/organizations/:id/zoom-credentials', ownerAuth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).select('organizationName subdomain zoomAccountId zoomClientId zoomClientSecret').lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({
      organizationId: organization._id,
      organizationName: organization.organizationName,
      subdomain: organization.subdomain,
      zoomAccountId: organization.zoomAccountId || '',
      zoomClientId: organization.zoomClientId || '',
      zoomClientSecret: organization.zoomClientSecret || ''
    });
  } catch (error) {
    console.error('Get Zoom credentials error:', error);
    res.status(500).json({ message: 'Error fetching Zoom credentials', error: error.message });
  }
});

// @route   PUT /api/admin/organizations/:id/zoom-credentials
// @desc    Update Zoom credentials for an organization
// @access  Private (Owner)
router.put('/organizations/:id/zoom-credentials', ownerAuth, async (req, res) => {
  try {
    const { zoomAccountId, zoomClientId, zoomClientSecret } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update Zoom credentials
    organization.zoomAccountId = zoomAccountId || '';
    organization.zoomClientId = zoomClientId || '';
    organization.zoomClientSecret = zoomClientSecret || '';

    await organization.save();

    res.json({
      message: 'Zoom credentials updated successfully',
      hasZoomCredentials: !!(zoomAccountId && zoomClientId && zoomClientSecret)
    });
  } catch (error) {
    console.error('Update Zoom credentials error:', error);
    res.status(500).json({ message: 'Error updating Zoom credentials', error: error.message });
  }
});

module.exports = router;
