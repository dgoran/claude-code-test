import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicMeeting } from '../utils/api';
import './LandingPage.css';

const LandingPage = () => {
  const { subdomain, meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeetingData();
  }, [subdomain, meetingId]);

  const loadMeetingData = async () => {
    try {
      const response = await getPublicMeeting(subdomain, meetingId);
      setMeeting(response.data.meeting);
      setOrganization(response.data.organization);
    } catch (err) {
      setError('Meeting not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="landing-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="landing-container">
        <div className="error-page">
          <h1>404</h1>
          <p>{error || 'Meeting not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>{organization?.organizationName}</h1>
      </div>

      <div className="landing-content">
        <div className="landing-hero">
          <span className="event-type">
            {meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'}
          </span>
          <h2>{meeting.landingPageTitle || meeting.meetingName}</h2>
          <p className="landing-description">
            {meeting.landingPageDescription || meeting.description}
          </p>

          <div className="meeting-info">
            <div className="info-box">
              <strong>Date & Time</strong>
              <p>{new Date(meeting.startTime).toLocaleString()}</p>
            </div>
            <div className="info-box">
              <strong>Duration</strong>
              <p>{meeting.duration} minutes</p>
            </div>
            <div className="info-box">
              <strong>Timezone</strong>
              <p>{meeting.timezone}</p>
            </div>
          </div>

          <Link to={`/${subdomain}/${meetingId}/register`}>
            <button className="btn btn-primary btn-large">
              Register Now
            </button>
          </Link>
        </div>

        <div className="landing-footer">
          <p>Powered by Zoom Registration Platform</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
