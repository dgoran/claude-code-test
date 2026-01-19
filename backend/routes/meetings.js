const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Organization = require('../models/Organization');
const authMiddleware = require('../middleware/auth');
const ZoomService = require('../services/zoomService');

// Create a new meeting/webinar
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      meetingName,
      meetingType,
      description,
      startTime,
      duration,
      timezone,
      landingPageTitle,
      landingPageDescription,
      createInZoom
    } = req.body;

    // Validate input
    if (!meetingName || !meetingType || !startTime) {
      return res.status(400).json({ error: 'Please provide meeting name, type, and start time' });
    }

    if (!['meeting', 'webinar'].includes(meetingType)) {
      return res.status(400).json({ error: 'Meeting type must be either "meeting" or "webinar"' });
    }

    let zoomMeetingId = '';

    // Create in Zoom if requested and credentials are available
    if (createInZoom) {
      const org = req.organization;

      if (!org.zoomAccountId || !org.zoomClientId || !org.zoomClientSecret) {
        return res.status(400).json({ error: 'Zoom credentials not configured. Please add them in settings first.' });
      }

      const zoomService = new ZoomService(
        org.zoomAccountId,
        org.zoomClientId,
        org.zoomClientSecret
      );

      try {
        let zoomResponse;
        const zoomData = {
          topic: meetingName,
          start_time: startTime,
          duration: duration || 60,
          timezone: timezone || 'UTC'
        };

        if (meetingType === 'webinar') {
          zoomResponse = await zoomService.createWebinar(zoomData);
        } else {
          zoomResponse = await zoomService.createMeeting(zoomData);
        }

        zoomMeetingId = zoomResponse.id.toString();
      } catch (error) {
        console.error('Zoom creation error:', error);
        return res.status(500).json({ error: 'Failed to create meeting in Zoom. Please check your credentials.' });
      }
    }

    // Create meeting in database
    const meeting = new Meeting({
      organizationId: req.organizationId,
      meetingName,
      meetingType,
      description: description || '',
      zoomMeetingId,
      startTime,
      duration: duration || 60,
      timezone: timezone || 'UTC',
      landingPageTitle: landingPageTitle || meetingName,
      landingPageDescription: landingPageDescription || description || ''
    });

    await meeting.save();

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Get all meetings for the organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    const meetings = await Meeting.find({ organizationId: req.organizationId })
      .sort({ startTime: -1 });

    res.json({ meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Failed to get meetings' });
  }
});

// Get a specific meeting by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizationId: req.organizationId
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ error: 'Failed to get meeting' });
  }
});

// Get meeting by subdomain and meeting ID (public route for landing page)
router.get('/public/:subdomain/:meetingId', async (req, res) => {
  try {
    const organization = await Organization.findOne({
      subdomain: req.params.subdomain,
      isActive: true
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const meeting = await Meeting.findOne({
      _id: req.params.meetingId,
      organizationId: organization._id,
      isActive: true
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({
      meeting: {
        id: meeting._id,
        meetingName: meeting.meetingName,
        meetingType: meeting.meetingType,
        description: meeting.description,
        startTime: meeting.startTime,
        duration: meeting.duration,
        timezone: meeting.timezone,
        landingPageTitle: meeting.landingPageTitle,
        landingPageDescription: meeting.landingPageDescription
      },
      organization: {
        organizationName: organization.organizationName,
        subdomain: organization.subdomain
      }
    });
  } catch (error) {
    console.error('Get public meeting error:', error);
    res.status(500).json({ error: 'Failed to get meeting' });
  }
});

// Update a meeting
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizationId: req.organizationId
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const allowedUpdates = [
      'meetingName',
      'description',
      'startTime',
      'duration',
      'timezone',
      'landingPageTitle',
      'landingPageDescription',
      'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        meeting[field] = req.body[field];
      }
    });

    await meeting.save();

    res.json({
      message: 'Meeting updated successfully',
      meeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// Delete a meeting
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

module.exports = router;
