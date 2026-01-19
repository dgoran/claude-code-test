import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getOwnerToken } from '../utils/ownerAuth';
import './MeetingDetails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerOrganizationDetails() {
  const { id } = useParams();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizationDetails();
  }, [id]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/organizations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrgData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError('Failed to load organization details');
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(
      `Are you sure you want to ${orgData.organization.isActive ? 'deactivate' : 'activate'} this organization?`
    )) {
      return;
    }

    try {
      const token = getOwnerToken();
      await axios.put(
        `${API_URL}/admin/organizations/${id}`,
        { isActive: !orgData.organization.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrganizationDetails();
    } catch (err) {
      console.error('Error updating organization:', err);
      alert('Failed to update organization status');
    }
  };

  if (loading) {
    return <div className="meeting-details-container"><p>Loading organization details...</p></div>;
  }

  if (error) {
    return <div className="meeting-details-container"><p className="error">{error}</p></div>;
  }

  const { organization, stats, recentMeetings, recentRegistrants, registrationTrend } = orgData;

  return (
    <div className="meeting-details-container">
      <div className="page-header">
        <h1>{organization.organizationName}</h1>
        <div>
          <button className="btn-secondary" onClick={() => navigate('/owner/organizations')}>
            Back to Organizations
          </button>
          <button
            className={`btn-${organization.isActive ? 'warning' : 'success'}`}
            onClick={handleToggleStatus}
            style={{ marginLeft: '10px' }}
          >
            {organization.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Organization Info */}
      <div className="details-section">
        <h2>Organization Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Organization Name:</label>
            <span>{organization.organizationName}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{organization.email}</span>
          </div>
          <div className="info-item">
            <label>Subdomain:</label>
            <span><code>{organization.subdomain}</code></span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={`status-badge ${organization.isActive ? 'status-active' : 'status-inactive'}`}>
              {organization.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="info-item">
            <label>Created:</label>
            <span>{new Date(organization.createdAt).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <label>Zoom Integration:</label>
            <span>{stats.hasZoomCredentials ? '✅ Configured' : '❌ Not Configured'}</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="details-section">
        <h2>Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Total Meetings</h3>
              <p className="stat-number">{stats.meetings}</p>
              <p className="stat-detail">{stats.activeMeetings} active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Registrants</h3>
              <p className="stat-number">{stats.totalRegistrants}</p>
              <p className="stat-detail">Across all meetings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Zoom Synced</h3>
              <p className="stat-number">{stats.syncedToZoom}</p>
              <p className="stat-detail">{stats.syncRate}% sync rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="details-section">
        <h2>Recent Meetings</h2>
        {recentMeetings.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Meeting Name</th>
                  <th>Type</th>
                  <th>Start Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMeetings.map((meeting) => (
                  <tr key={meeting._id}>
                    <td>{meeting.meetingName}</td>
                    <td>
                      <span className="badge">
                        {meeting.meetingType === 'webinar' ? '📹 Webinar' : '🎥 Meeting'}
                      </span>
                    </td>
                    <td>{new Date(meeting.startTime).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${meeting.isActive ? 'status-active' : 'status-inactive'}`}>
                        {meeting.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No meetings yet</p>
        )}
      </div>

      {/* Recent Registrants */}
      <div className="details-section">
        <h2>Recent Registrants (Last 10)</h2>
        {recentRegistrants.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Meeting</th>
                  <th>Zoom Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrants.map((registrant) => (
                  <tr key={registrant._id}>
                    <td>{registrant.firstName} {registrant.lastName}</td>
                    <td>{registrant.email}</td>
                    <td>{registrant.meetingId?.meetingName || 'N/A'}</td>
                    <td>
                      {registrant.syncedToZoom ? (
                        <span className="status-badge status-active">Synced</span>
                      ) : registrant.syncError ? (
                        <span className="status-badge status-error" title={registrant.syncError}>
                          Error
                        </span>
                      ) : (
                        <span className="status-badge status-pending">Pending</span>
                      )}
                    </td>
                    <td>{new Date(registrant.registeredAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No registrants yet</p>
        )}
      </div>

      {/* Registration Trend */}
      {registrationTrend.length > 0 && (
        <div className="details-section">
          <h2>Registration Trend (Last 30 Days)</h2>
          <div className="trend-chart">
            {registrationTrend.map((day) => (
              <div key={day._id} className="trend-item">
                <div className="trend-date">{new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="trend-bar" style={{ width: `${(day.count / Math.max(...registrationTrend.map(d => d.count))) * 100}%` }}>
                  {day.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerOrganizationDetails;
