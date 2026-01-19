import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getOwnerToken } from '../utils/ownerAuth';
import './Meetings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/organizations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: statusFilter
        }
      });
      setOrganizations(response.data.organizations);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Failed to load organizations');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleToggleStatus = async (orgId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this organization?`)) {
      return;
    }

    try {
      const token = getOwnerToken();
      await axios.put(
        `${API_URL}/admin/organizations/${orgId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrganizations();
    } catch (err) {
      console.error('Error updating organization:', err);
      alert('Failed to update organization status');
    }
  };

  const handleDelete = async (orgId, orgName) => {
    if (!window.confirm(
      `Are you sure you want to DELETE "${orgName}"?\n\nThis will permanently delete:\n- The organization\n- All meetings\n- All registrants\n\nThis action CANNOT be undone!`
    )) {
      return;
    }

    try {
      const token = getOwnerToken();
      await axios.delete(`${API_URL}/admin/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrganizations();
      alert('Organization deleted successfully');
    } catch (err) {
      console.error('Error deleting organization:', err);
      alert('Failed to delete organization');
    }
  };

  return (
    <div className="meetings-container">
      <div className="page-header">
        <h1>Manage Organizations</h1>
        <button className="btn-primary" onClick={() => navigate('/owner/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, email, or subdomain..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={handleStatusFilter}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading organizations...</p>
      ) : (
        <>
          <div className="table-container">
            <table className="meetings-table">
              <thead>
                <tr>
                  <th>Organization Name</th>
                  <th>Email</th>
                  <th>Subdomain</th>
                  <th>Meetings</th>
                  <th>Registrants</th>
                  <th>Zoom Sync</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.length > 0 ? (
                  organizations.map((org) => (
                    <tr key={org._id}>
                      <td>
                        <strong>{org.organizationName}</strong>
                      </td>
                      <td>{org.email}</td>
                      <td>
                        <code>{org.subdomain}</code>
                      </td>
                      <td>{org.stats.meetings}</td>
                      <td>{org.stats.registrants}</td>
                      <td>
                        {org.stats.registrants > 0 ? (
                          <span>
                            {org.stats.syncedToZoom} / {org.stats.registrants}
                            {org.stats.hasZoomCredentials ? ' ✓' : ' ⚠'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${org.isActive ? 'status-active' : 'status-inactive'}`}>
                          {org.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-small btn-primary"
                            onClick={() => navigate(`/owner/organizations/${org._id}`)}
                            title="View Details"
                          >
                            View
                          </button>
                          <button
                            className={`btn-small ${org.isActive ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleStatus(org._id, org.isActive)}
                            title={org.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {org.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDelete(org._id, org.organizationName)}
                            title="Delete Organization"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>
                      No organizations found
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

export default OwnerOrganizations;
