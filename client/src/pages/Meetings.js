import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMeetings, deleteMeeting } from '../utils/api';
import { getOrganization } from '../utils/auth';
import './Meetings.css';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const organization = getOrganization();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await getMeetings();
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(id);
        setMeetings(meetings.filter(m => m._id !== id));
      } catch (error) {
        alert('Failed to delete meeting');
      }
    }
  };

  const copyLink = async (meetingId) => {
    const link = `${window.location.origin}/${organization.subdomain}/${meetingId}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Link copied to clipboard!');
        } catch (err) {
          alert('Failed to copy link. Please copy manually.');
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy link. Please copy manually.');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading meetings...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Meetings & Webinars</h1>
        <Link to="/meetings/create">
          <button className="btn btn-primary">Create New Meeting</button>
        </Link>
      </div>

        {meetings.length > 0 ? (
          <div className="meetings-grid">
            {meetings.map((meeting) => (
              <div key={meeting._id} className="meeting-card">
                <div className="meeting-card-header">
                  <h3>{meeting.meetingName}</h3>
                  <span className={`badge ${meeting.isActive ? 'badge-success' : 'badge-secondary'}`}>
                    {meeting.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="meeting-type">
                  {meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'}
                </p>
                <p className="meeting-date">
                  {new Date(meeting.startTime).toLocaleString()} • {meeting.duration} min
                </p>
                {meeting.description && (
                  <p className="meeting-description">{meeting.description}</p>
                )}
                <div className="meeting-actions">
                  <Link to={`/meetings/${meeting._id}`}>
                    <button className="btn btn-primary">View Details</button>
                  </Link>
                  <button onClick={() => copyLink(meeting._id)} className="btn btn-secondary">
                    Copy Link
                  </button>
                  <button onClick={() => handleDelete(meeting._id)} className="btn btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No meetings yet</h2>
            <p>Create your first meeting or webinar to get started</p>
            <Link to="/meetings/create">
              <button className="btn btn-primary">Create Meeting</button>
            </Link>
          </div>
        )}
    </div>
  );
};

export default Meetings;
