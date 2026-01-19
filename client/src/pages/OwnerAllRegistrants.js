import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getOwnerToken } from '../utils/ownerAuth';
import './Meetings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerAllRegistrants() {
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrants();
  }, [pagination.page, searchTerm]);

  const fetchRegistrants = async () => {
    try {
      setLoading(true);
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/registrants`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      setRegistrants(response.data.registrants);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching registrants:', err);
      setError('Failed to load registrants');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="meetings-container">
      <div className="page-header">
        <h1>All Registrants</h1>
        <button className="btn-primary" onClick={() => navigate('/owner/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {/* Search */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading registrants...</p>
      ) : (
        <>
          <div className="table-container">
            <table className="meetings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Organization</th>
                  <th>Meeting</th>
                  <th>Zoom Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {registrants.length > 0 ? (
                  registrants.map((registrant) => (
                    <tr key={registrant._id}>
                      <td>
                        <strong>{registrant.firstName} {registrant.lastName}</strong>
                      </td>
                      <td>{registrant.email}</td>
                      <td>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/owner/organizations/${registrant.organizationId._id}`);
                          }}
                        >
                          {registrant.organizationId.organizationName}
                        </a>
                      </td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
                      No registrants found
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

export default OwnerAllRegistrants;
