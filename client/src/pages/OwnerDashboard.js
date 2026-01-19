import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getOwnerToken, getOwnerData } from '../utils/ownerAuth';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const ownerData = getOwnerData();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading dashboard...</p></div>;
  }

  if (error) {
    return <div className="dashboard-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Website Owner Dashboard</h1>
        <p className="welcome-text">Welcome back, {ownerData?.name}!</p>
      </div>

      {/* Summary Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Total Organizations</h3>
            <p className="stat-number">{stats?.summary?.organizations?.total || 0}</p>
            <p className="stat-detail">
              {stats?.summary?.organizations?.active || 0} active, {stats?.summary?.organizations?.inactive || 0} inactive
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Total Meetings</h3>
            <p className="stat-number">{stats?.summary?.meetings?.total || 0}</p>
            <p className="stat-detail">
              {stats?.summary?.meetings?.active || 0} active meetings
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Registrants</h3>
            <p className="stat-number">{stats?.summary?.registrants?.total || 0}</p>
            <p className="stat-detail">
              {stats?.summary?.registrants?.syncRate}% synced to Zoom
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Zoom Synced</h3>
            <p className="stat-number">{stats?.summary?.registrants?.syncedToZoom || 0}</p>
            <p className="stat-detail">
              Successfully synced registrations
            </p>
          </div>
        </div>
      </div>

      {/* Top Organizations */}
      <div className="dashboard-section">
        <h2>Top Organizations by Registrants</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Subdomain</th>
                <th>Registrants</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topOrganizations?.length > 0 ? (
                stats.topOrganizations.map((org) => (
                  <tr key={org._id}>
                    <td>{org.organizationName}</td>
                    <td>{org.subdomain}</td>
                    <td>{org.registrants}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Organizations */}
      <div className="dashboard-section">
        <h2>Recent Organizations</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Email</th>
                <th>Subdomain</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrganizations?.length > 0 ? (
                stats.recentOrganizations.map((org) => (
                  <tr key={org._id}>
                    <td>{org.organizationName}</td>
                    <td>{org.email}</td>
                    <td>{org.subdomain}</td>
                    <td>
                      <span className={`status-badge ${org.isActive ? 'status-active' : 'status-inactive'}`}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-small btn-primary"
                        onClick={() => navigate(`/owner/organizations/${org._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No organizations yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button
            className="action-button"
            onClick={() => navigate('/owner/organizations')}
          >
            <span className="action-icon">🏢</span>
            <span>Manage Organizations</span>
          </button>
          <button
            className="action-button"
            onClick={() => navigate('/owner/meetings')}
          >
            <span className="action-icon">📅</span>
            <span>View All Meetings</span>
          </button>
          <button
            className="action-button"
            onClick={() => navigate('/owner/registrants')}
          >
            <span className="action-icon">👥</span>
            <span>View All Registrants</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
