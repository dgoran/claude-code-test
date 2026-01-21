import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getOwnerToken } from '../utils/ownerAuth';
import './Meetings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerAllMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, [pagination.page, searchTerm]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/meetings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      setMeetings(response.data.meetings);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleDelete = async (meetingId, meetingName) => {
    if (!window.confirm(
      `Are you sure you want to DELETE "${meetingName}"?\n\nThis will permanently delete:\n- The meeting\n- All registrants for this meeting\n\nThis action CANNOT be undone!`
    )) {
      return;
    }

    try {
      const token = getOwnerToken();
      await axios.delete(`${API_URL}/admin/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meeting deleted successfully');
      fetchMeetings();
    } catch (err) {
      console.error('Error deleting meeting:', err);
      alert('Failed to delete meeting');
    }
  };

  return (
    <div className="meetings-container">
      <div className="page-header">
        <h1>All Meetings</h1>
        <button className="btn-primary" onClick={() => navigate('/owner/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {/* Search */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading meetings...</p>
      ) : (
        <>
          <div className="table-container">
            <table className="meetings-table">
              <thead>
                <tr>
                  <th>Meeting Name</th>
                  <th>Organization</th>
                  <th>Type</th>
                  <th>Start Time</th>
                  <th>Registrants</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.length > 0 ? (
                  meetings.map((meeting) => (
                    <tr key={meeting._id}>
                      <td>
                        <strong>{meeting.meetingName}</strong>
                      </td>
                      <td>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/owner/organizations/${meeting.organizationId._id}`);
                          }}
                        >
                          {meeting.organizationId.organizationName}
                        </a>
                      </td>
                      <td>
                        <span className="badge">
                          {meeting.meetingType === 'webinar' ? '📹 Webinar' : '🎥 Meeting'}
                        </span>
                      </td>
                      <td>{new Date(meeting.startTime).toLocaleString()}</td>
                      <td>{meeting.registrantCount || 0}</td>
                      <td>
                        <span className={`status-badge ${meeting.isActive ? 'status-active' : 'status-inactive'}`}>
                          {meeting.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(meeting.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleDelete(meeting._id, meeting.meetingName)}
                          title="Delete Meeting"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>
                      No meetings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OwnerAllMeetings;
