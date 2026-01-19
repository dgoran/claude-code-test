const express = require('express');
const router = express.Router();
const Registrant = require('../models/Registrant');
const Meeting = require('../models/Meeting');
const Organization = require('../models/Organization');
const authMiddleware = require('../middleware/auth');
const ZoomService = require('../services/zoomService');

// Register a new attendee (public route)
router.post('/register', async (req, res) => {
  try {
    const {
      subdomain,
      meetingId,
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      customFields
    } = req.body;

    // Validate input
    if (!subdomain || !meetingId || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Find organization
    const organization = await Organization.findOne({
      subdomain,
      isActive: true
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Find meeting
    const meeting = await Meeting.findOne({
      _id: meetingId,
      organizationId: organization._id,
      isActive: true
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Check if already registered
    const existingRegistrant = await Registrant.findOne({
      meetingId,
      email: email.toLowerCase()
    });

    if (existingRegistrant) {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }

    // Create registrant in database
    const registrant = new Registrant({
      meetingId,
      organizationId: organization._id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      company: company || '',
      jobTitle: jobTitle || '',
      customFields: customFields || {}
    });

    // Try to register in Zoom if credentials are available and meeting has Zoom ID
    if (meeting.zoomMeetingId && organization.zoomAccountId && organization.zoomClientId && organization.zoomClientSecret) {
      try {
        const zoomService = new ZoomService(
          organization.zoomAccountId,
          organization.zoomClientId,
          organization.zoomClientSecret
        );

        const registrantData = {
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          phone: phone || '',
          company: company || '',
          job_title: jobTitle || ''
        };

        let zoomResponse;
        if (meeting.meetingType === 'webinar') {
          zoomResponse = await zoomService.addWebinarRegistrant(meeting.zoomMeetingId, registrantData);
        } else {
          zoomResponse = await zoomService.addMeetingRegistrant(meeting.zoomMeetingId, registrantData);
        }

        registrant.zoomRegistrantId = zoomResponse.id || zoomResponse.registrant_id;
        registrant.zoomJoinUrl = zoomResponse.join_url;
        registrant.syncedToZoom = true;
      } catch (zoomError) {
        console.error('Zoom registration error:', zoomError);
        registrant.syncError = zoomError.message;
        // Continue saving to our database even if Zoom fails
      }
    }

    await registrant.save();

    res.status(201).json({
      message: 'Registration successful',
      registrant: {
        id: registrant._id,
        firstName: registrant.firstName,
        lastName: registrant.lastName,
        email: registrant.email,
        syncedToZoom: registrant.syncedToZoom,
        zoomJoinUrl: registrant.zoomJoinUrl
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register for the event' });
  }
});

// Get all registrants for a meeting (authenticated)
router.get('/meeting/:meetingId', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.meetingId,
      organizationId: req.organizationId
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const registrants = await Registrant.find({ meetingId: req.params.meetingId })
      .sort({ registeredAt: -1 });

    res.json({ registrants });
  } catch (error) {
    console.error('Get registrants error:', error);
    res.status(500).json({ error: 'Failed to get registrants' });
  }
});

// Get all registrants for the organization (authenticated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const registrants = await Registrant.find({ organizationId: req.organizationId })
      .populate('meetingId', 'meetingName meetingType startTime')
      .sort({ registeredAt: -1 });

    res.json({ registrants });
  } catch (error) {
    console.error('Get all registrants error:', error);
    res.status(500).json({ error: 'Failed to get registrants' });
  }
});

// Retry syncing a registrant to Zoom (authenticated)
router.post('/:id/sync', authMiddleware, async (req, res) => {
  try {
    const registrant = await Registrant.findOne({
      _id: req.params.id,
      organizationId: req.organizationId
    }).populate('meetingId');

    if (!registrant) {
      return res.status(404).json({ error: 'Registrant not found' });
    }

    if (registrant.syncedToZoom) {
      return res.status(400).json({ error: 'Registrant is already synced to Zoom' });
    }

    const meeting = registrant.meetingId;
    if (!meeting.zoomMeetingId) {
      return res.status(400).json({ error: 'Meeting does not have a Zoom ID' });
    }

    const organization = req.organization;
    if (!organization.zoomAccountId || !organization.zoomClientId || !organization.zoomClientSecret) {
      return res.status(400).json({ error: 'Zoom credentials not configured' });
    }

    const zoomService = new ZoomService(
      organization.zoomAccountId,
      organization.zoomClientId,
      organization.zoomClientSecret
    );

    const registrantData = {
      email: registrant.email,
      first_name: registrant.firstName,
      last_name: registrant.lastName,
      phone: registrant.phone,
      company: registrant.company,
      job_title: registrant.jobTitle
    };

    let zoomResponse;
    if (meeting.meetingType === 'webinar') {
      zoomResponse = await zoomService.addWebinarRegistrant(meeting.zoomMeetingId, registrantData);
    } else {
      zoomResponse = await zoomService.addMeetingRegistrant(meeting.zoomMeetingId, registrantData);
    }

    registrant.zoomRegistrantId = zoomResponse.id || zoomResponse.registrant_id;
    registrant.zoomJoinUrl = zoomResponse.join_url;
    registrant.syncedToZoom = true;
    registrant.syncError = '';

    await registrant.save();

    res.json({
      message: 'Registrant synced to Zoom successfully',
      registrant
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync registrant to Zoom' });
  }
});

// Delete a registrant (authenticated)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const registrant = await Registrant.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId
    });

    if (!registrant) {
      return res.status(404).json({ error: 'Registrant not found' });
    }

    res.json({ message: 'Registrant deleted successfully' });
  } catch (error) {
    console.error('Delete registrant error:', error);
    res.status(500).json({ error: 'Failed to delete registrant' });
  }
});

module.exports = router;
