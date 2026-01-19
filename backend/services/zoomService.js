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

  // Add registrant to meeting
  async addMeetingRegistrant(meetingId, registrantData) {
    try {
      const token = await this.getAccessToken();

      const payload = {
        email: registrantData.email,
        first_name: registrantData.first_name,
        last_name: registrantData.last_name
      };

      // Add optional fields if they exist
      if (registrantData.phone) payload.phone = registrantData.phone;
      if (registrantData.address) payload.address = registrantData.address;
      if (registrantData.city) payload.city = registrantData.city;
      if (registrantData.country) payload.country = registrantData.country;
      if (registrantData.zip) payload.zip = registrantData.zip;
      if (registrantData.state) payload.state = registrantData.state;
      if (registrantData.company) payload.org = registrantData.company;
      if (registrantData.job_title) payload.job_title = registrantData.job_title;
      if (registrantData.industry) payload.industry = registrantData.industry;
      if (registrantData.purchasing_time_frame) payload.purchasing_time_frame = registrantData.purchasing_time_frame;
      if (registrantData.role_in_purchase_process) payload.role_in_purchase_process = registrantData.role_in_purchase_process;
      if (registrantData.no_of_employees) payload.no_of_employees = registrantData.no_of_employees;
      if (registrantData.comments) payload.comments = registrantData.comments;

      const response = await axios.post(
        `https://api.zoom.us/v2/meetings/${meetingId}/registrants`,
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
      console.error('Error adding meeting registrant:', error.response?.data || error.message);
      throw new Error('Failed to add registrant to Zoom meeting');
    }
  }

  // Add registrant to webinar
  async addWebinarRegistrant(webinarId, registrantData) {
    try {
      const token = await this.getAccessToken();

      const payload = {
        email: registrantData.email,
        first_name: registrantData.first_name,
        last_name: registrantData.last_name
      };

      // Add optional fields if they exist
      if (registrantData.phone) payload.phone = registrantData.phone;
      if (registrantData.address) payload.address = registrantData.address;
      if (registrantData.city) payload.city = registrantData.city;
      if (registrantData.country) payload.country = registrantData.country;
      if (registrantData.zip) payload.zip = registrantData.zip;
      if (registrantData.state) payload.state = registrantData.state;
      if (registrantData.company) payload.org = registrantData.company;
      if (registrantData.job_title) payload.job_title = registrantData.job_title;
      if (registrantData.industry) payload.industry = registrantData.industry;
      if (registrantData.purchasing_time_frame) payload.purchasing_time_frame = registrantData.purchasing_time_frame;
      if (registrantData.role_in_purchase_process) payload.role_in_purchase_process = registrantData.role_in_purchase_process;
      if (registrantData.no_of_employees) payload.no_of_employees = registrantData.no_of_employees;
      if (registrantData.comments) payload.comments = registrantData.comments;

      const response = await axios.post(
        `https://api.zoom.us/v2/webinars/${webinarId}/registrants`,
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
      console.error('Error adding webinar registrant:', error.response?.data || error.message);
      throw new Error('Failed to add registrant to Zoom webinar');
    }
  }

  // Get meeting details
  async getMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `https://api.zoom.us/v2/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting meeting details:', error.response?.data || error.message);
      throw new Error('Failed to get Zoom meeting details');
    }
  }

  // Get webinar details
  async getWebinar(webinarId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `https://api.zoom.us/v2/webinars/${webinarId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting webinar details:', error.response?.data || error.message);
      throw new Error('Failed to get Zoom webinar details');
    }
  }
}

module.exports = ZoomService;
