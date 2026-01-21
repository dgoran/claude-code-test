import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getOwnerToken } from '../utils/ownerAuth';
import './Meetings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerZoomSettings() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [editingOrg, setEditingOrg] = useState(null);
  const [zoomCredentials, setZoomCredentials] = useState({
    zoomAccountId: '',
    zoomClientId: '',
    zoomClientSecret: ''
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, [pagination.page, searchTerm]);

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
          status: 'all'
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

  const handleEditZoom = async (orgId) => {
    try {
      const token = getOwnerToken();
      const response = await axios.get(
        `${API_URL}/admin/organizations/${orgId}/zoom-credentials`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setZoomCredentials({
        zoomAccountId: response.data.zoomAccountId,
        zoomClientId: response.data.zoomClientId,
        zoomClientSecret: response.data.zoomClientSecret
      });
      setEditingOrg(response.data);
    } catch (err) {
      console.error('Error fetching Zoom credentials:', err);
      alert('Failed to load Zoom credentials');
    }
  };

  const handleSaveZoom = async () => {
    if (!editingOrg) return;

    try {
      setSaving(true);
      const token = getOwnerToken();
      await axios.put(
        `${API_URL}/admin/organizations/${editingOrg.organizationId}/zoom-credentials`,
        zoomCredentials,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Zoom credentials updated successfully');
      setEditingOrg(null);
      setZoomCredentials({ zoomAccountId: '', zoomClientId: '', zoomClientSecret: '' });
      fetchOrganizations();
    } catch (err) {
      console.error('Error updating Zoom credentials:', err);
      alert('Failed to update Zoom credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrg(null);
    setZoomCredentials({ zoomAccountId: '', zoomClientId: '', zoomClientSecret: '' });
  };

  return (
    <div className="meetings-container">
      <div className="page-header">
        <h1>Zoom API Settings</h1>
        <button className="btn-primary" onClick={() => navigate('/owner/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {/* Search */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by organization name or subdomain..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Edit Modal */}
      {editingOrg && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Zoom Credentials</h2>
            <p>Organization: <strong>{editingOrg.organizationName}</strong></p>
            <p>Subdomain: <code>{editingOrg.subdomain}</code></p>

            <div className="form-group">
              <label>Zoom Account ID:</label>
              <input
                type="text"
                value={zoomCredentials.zoomAccountId}
                onChange={(e) => setZoomCredentials({ ...zoomCredentials, zoomAccountId: e.target.value })}
                placeholder="Enter Zoom Account ID"
              />
            </div>

            <div className="form-group">
              <label>Zoom Client ID:</label>
              <input
                type="text"
                value={zoomCredentials.zoomClientId}
                onChange={(e) => setZoomCredentials({ ...zoomCredentials, zoomClientId: e.target.value })}
                placeholder="Enter Zoom Client ID"
              />
            </div>

            <div className="form-group">
              <label>Zoom Client Secret:</label>
              <input
                type="password"
                value={zoomCredentials.zoomClientSecret}
                onChange={(e) => setZoomCredentials({ ...zoomCredentials, zoomClientSecret: e.target.value })}
                placeholder="Enter Zoom Client Secret"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={handleSaveZoom}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Credentials'}
              </button>
              <button
                className="btn-secondary"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading organizations...</p>
      ) : (
        <>
          <div className="table-container">
            <table className="meetings-table">
              <thead>
                <tr>
                  <th>Organization Name</th>
                  <th>Subdomain</th>
                  <th>Zoom Account ID</th>
                  <th>Zoom Client ID</th>
                  <th>Status</th>
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
                      <td>
                        <code>{org.subdomain}</code>
                      </td>
                      <td>
                        {org.zoomAccountId ? (
                          <span title={org.zoomAccountId}>
                            {org.zoomAccountId.substring(0, 15)}...
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>Not set</span>
                        )}
                      </td>
                      <td>
                        {org.zoomClientId ? (
                          <span title={org.zoomClientId}>
                            {org.zoomClientId.substring(0, 15)}...
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>Not set</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${org.stats.hasZoomCredentials ? 'status-active' : 'status-inactive'}`}>
                          {org.stats.hasZoomCredentials ? 'Configured' : 'Not Configured'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-small btn-primary"
                          onClick={() => handleEditZoom(org._id)}
                        >
                          Edit Credentials
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
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

export default OwnerZoomSettings;
