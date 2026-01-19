import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMeetings, getRegistrants } from '../utils/api';
import { getOrganization } from '../utils/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const organization = getOrganization();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [meetingsRes, registrantsRes] = await Promise.all([
        getMeetings(),
        getRegistrants()
      ]);

      setMeetings(meetingsRes.data.meetings);
      setRegistrants(registrantsRes.data.registrants);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </>
    );
  }

  const activeMeetings = meetings.filter(m => m.isActive);
  const totalRegistrants = registrants.length;
  const syncedRegistrants = registrants.filter(r => r.syncedToZoom).length;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {organization?.organizationName}</h1>
          <Link to="/meetings/create">
            <button className="btn btn-primary">Create New Meeting</button>
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{activeMeetings.length}</h3>
            <p>Active Meetings</p>
          </div>
          <div className="stat-card">
            <h3>{totalRegistrants}</h3>
            <p>Total Registrants</p>
          </div>
          <div className="stat-card">
            <h3>{syncedRegistrants}</h3>
            <p>Synced to Zoom</p>
          </div>
          <div className="stat-card">
            <h3>{organization?.subdomain}</h3>
            <p>Your Subdomain</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Meetings</h2>
          {meetings.length > 0 ? (
            <div className="meetings-list">
              {meetings.slice(0, 5).map((meeting) => (
                <div key={meeting._id} className="meeting-card-small">
                  <div>
                    <h3>{meeting.meetingName}</h3>
                    <p>
                      {meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'} •
                      {new Date(meeting.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to={`/meetings/${meeting._id}`}>
                    <button className="btn btn-secondary">View Details</button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No meetings yet. Create your first meeting to get started!</p>
              <Link to="/meetings/create">
                <button className="btn btn-primary">Create Meeting</button>
              </Link>
            </div>
          )}
        </div>

        {!organization?.hasZoomCredentials && (
          <div className="alert alert-info">
            <strong>Setup Required:</strong> Please add your Zoom API credentials in{' '}
            <Link to="/settings">Settings</Link> to enable automatic registration syncing.
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
