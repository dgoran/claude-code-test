const axios = require('axios');

class ZoomService {
  constructor(accountId, clientId, clientSecret) {
    this.accountId = accountId;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get OAuth access token using Server-to-Server OAuth
  async getAccessToken() {
    try {
      // Check if we have a valid cached token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        'https://zoom.us/oauth/token',
        `grant_type=account_credentials&account_id=${this.accountId}`,
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Zoom access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Zoom API');
    }
  }

  // Create a meeting
  async createMeeting(meetingData) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `https://api.zoom.us/v2/users/me/meetings`,
        {
          topic: meetingData.topic,
          type: 2, // Scheduled meeting
          start_time: meetingData.start_time,
          duration: meetingData.duration,
          timezone: meetingData.timezone || 'UTC',
          settings: {
            approval_type: 0, // Automatically approve
            registration_type: 1, // Attendees register once
            join_before_host: true,
            waiting_room: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  // Create a webinar
  async createWebinar(webinarData) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `https://api.zoom.us/v2/users/me/webinars`,
        {
          topic: webinarData.topic,
          type: 5, // Webinar
          start_time: webinarData.start_time,
          duration: webinarData.duration,
          timezone: webinarData.timezone || 'UTC',
          settings: {
            approval_type: 0,
            registration_type: 1,
            auto_recording: 'none'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Zoom webinar:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom webinar');
    }
  }

  // Build registrant payload from data (extracted to avoid duplication)
  buildRegistrantPayload(registrantData) {
    const payload = {
      email: registrantData.email,
      first_name: registrantData.first_name,
      last_name: registrantData.last_name
    };

    // Add optional fields if they exist
    const optionalFields = [
      'phone', 'address', 'city', 'country', 'zip', 'state',
      'job_title', 'industry', 'purchasing_time_frame',
      'role_in_purchase_process', 'no_of_employees', 'comments'
    ];

    optionalFields.forEach(field => {
      if (registrantData[field]) {
        payload[field] = registrantData[field];
      }
    });

    // Map company to org (Zoom API uses 'org' instead of 'company')
    if (registrantData.company) {
      payload.org = registrantData.company;
    }

    return payload;
  }

  // Generic method to add registrant to meeting or webinar
  async addRegistrant(type, id, registrantData) {
    try {
      const token = await this.getAccessToken();
      const payload = this.buildRegistrantPayload(registrantData);
      const endpoint = type === 'meeting' ? 'meetings' : 'webinars';

      const response = await axios.post(
        `https://api.zoom.us/v2/${endpoint}/${id}/registrants`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error adding ${type} registrant:`, error.response?.data || error.message);
      throw new Error(`Failed to add registrant to Zoom ${type}`);
    }
  }

  // Add registrant to meeting (wrapper for backward compatibility)
  async addMeetingRegistrant(meetingId, registrantData) {
    return this.addRegistrant('meeting', meetingId, registrantData);
  }

  // Add registrant to webinar (wrapper for backward compatibility)
  async addWebinarRegistrant(webinarId, registrantData) {
    return this.addRegistrant('webinar', webinarId, registrantData);
  }

  // Generic method to get meeting or webinar details
  async getDetails(type, id) {
    try {
      const token = await this.getAccessToken();
      const endpoint = type === 'meeting' ? 'meetings' : 'webinars';

      const response = await axios.get(
        `https://api.zoom.us/v2/${endpoint}/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error getting ${type} details:`, error.response?.data || error.message);
      throw new Error(`Failed to get Zoom ${type} details`);
    }
  }

  // Get meeting details (wrapper for backward compatibility)
  async getMeeting(meetingId) {
    return this.getDetails('meeting', meetingId);
  }

  // Get webinar details (wrapper for backward compatibility)
  async getWebinar(webinarId) {
    return this.getDetails('webinar', webinarId);
  }
}

module.exports = ZoomService;
