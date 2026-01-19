import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMeeting, getMeetingRegistrants, syncRegistrant, deleteRegistrant } from '../utils/api';
import { getOrganization } from '../utils/auth';
import './MeetingDetails.css';

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const organization = getOrganization();
  const [meeting, setMeeting] = useState(null);
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetingData();
  }, [id]);

  const loadMeetingData = async () => {
    try {
      const [meetingRes, registrantsRes] = await Promise.all([
        getMeeting(id),
        getMeetingRegistrants(id)
      ]);

      setMeeting(meetingRes.data.meeting);
      setRegistrants(registrantsRes.data.registrants);
    } catch (error) {
      console.error('Error loading meeting data:', error);
      alert('Failed to load meeting data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (registrantId) => {
    try {
      await syncRegistrant(registrantId);
      loadMeetingData();
      alert('Registrant synced successfully!');
    } catch (error) {
      alert('Failed to sync registrant');
    }
  };

  const handleDelete = async (registrantId) => {
    if (window.confirm('Are you sure you want to delete this registrant?')) {
      try {
        await deleteRegistrant(registrantId);
        setRegistrants(registrants.filter(r => r._id !== registrantId));
      } catch (error) {
        alert('Failed to delete registrant');
      }
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/${organization.subdomain}/${meeting._id}`;
    navigator.clipboard.writeText(link);
    alert('Registration link copied to clipboard!');
  };

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Registered At', 'Synced to Zoom'];
    const rows = registrants.map(r => [
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      r.company,
      r.jobTitle,
      new Date(r.registeredAt).toLocaleString(),
      r.syncedToZoom ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrants-${meeting.meetingName}-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading">Loading meeting details...</div>
        </div>
      </>
    );
  }

  if (!meeting) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="alert alert-error">Meeting not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <button onClick={() => navigate('/meetings')} className="btn btn-secondary">
          ← Back to Meetings
        </button>

        <div className="meeting-header">
          <div>
            <h1>{meeting.meetingName}</h1>
            <p className="meeting-meta">
              {meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'} •
              {new Date(meeting.startTime).toLocaleString()} •
              {meeting.duration} minutes
            </p>
          </div>
          <button onClick={() => navigate(`/meetings/${id}/edit`)} className="btn btn-primary">
            Edit Meeting
          </button>
        </div>

        <div className="card">
          <h3>Meeting Information</h3>
          {meeting.description && (
            <div className="info-row">
              <strong>Description:</strong>
              <p>{meeting.description}</p>
            </div>
          )}
          <div className="info-row">
            <strong>Timezone:</strong>
            <span>{meeting.timezone}</span>
          </div>
          {meeting.zoomMeetingId && (
            <div className="info-row">
              <strong>Zoom Meeting ID:</strong>
              <span>{meeting.zoomMeetingId}</span>
            </div>
          )}
          <div className="info-row">
            <strong>Registration Link:</strong>
            <div className="link-container">
              <input
                type="text"
                value={`${window.location.origin}/${organization.subdomain}/${meeting._id}`}
                readOnly
              />
              <button onClick={copyLink} className="btn btn-primary">Copy Link</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="registrants-header">
            <h3>Registrants ({registrants.length})</h3>
            {registrants.length > 0 && (
              <button onClick={exportCSV} className="btn btn-success">
                Export CSV
              </button>
            )}
          </div>

          {registrants.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Registered</th>
                  <th>Zoom Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrants.map((registrant) => (
                  <tr key={registrant._id}>
                    <td>{registrant.firstName} {registrant.lastName}</td>
                    <td>{registrant.email}</td>
                    <td>{registrant.phone || '-'}</td>
                    <td>{registrant.company || '-'}</td>
                    <td>{new Date(registrant.registeredAt).toLocaleDateString()}</td>
                    <td>
                      {registrant.syncedToZoom ? (
                        <span className="badge badge-success">Synced</span>
                      ) : (
                        <span className="badge badge-secondary">Not Synced</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!registrant.syncedToZoom && meeting.zoomMeetingId && (
                          <button
                            onClick={() => handleSync(registrant._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Sync
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(registrant._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No registrants yet. Share your registration link to get started!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MeetingDetails;
