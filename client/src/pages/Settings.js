import React, { useState, useEffect } from 'react';
import { getProfile, updateZoomCredentials } from '../utils/api';
import { setOrganization } from '../utils/auth';
import './Settings.css';

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [zoomCredentials, setZoomCredentials] = useState({
    zoomAccountId: '',
    zoomClientId: '',
    zoomClientSecret: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data.organization);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setZoomCredentials({
      ...zoomCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!zoomCredentials.zoomAccountId || !zoomCredentials.zoomClientId || !zoomCredentials.zoomClientSecret) {
      setError('Please provide all Zoom credentials');
      return;
    }

    setSaving(true);

    try {
      const response = await updateZoomCredentials(zoomCredentials);
      setSuccess('Zoom credentials updated successfully!');

      // Update local storage
      const updatedProfile = { ...profile, hasZoomCredentials: true };
      setProfile(updatedProfile);
      setOrganization(updatedProfile);

      // Clear form
      setZoomCredentials({
        zoomAccountId: '',
        zoomClientId: '',
        zoomClientSecret: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update credentials');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Settings</h1>

        <div className="card">
          <h3>Organization Information</h3>
          <div className="info-section">
            <div className="info-item">
              <strong>Organization Name:</strong>
              <span>{profile?.organizationName}</span>
            </div>
            <div className="info-item">
              <strong>Email:</strong>
              <span>{profile?.email}</span>
            </div>
            <div className="info-item">
              <strong>Subdomain:</strong>
              <span>{profile?.subdomain}</span>
            </div>
            <div className="info-item">
              <strong>Member Since:</strong>
              <span>{new Date(profile?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Zoom API Credentials</h3>
          <p className="settings-description">
            Configure your Zoom API credentials to automatically sync registrants to your Zoom meetings and webinars.
            These credentials are stored securely and are only used for API integration.
          </p>

          {profile?.hasZoomCredentials && (
            <div className="alert alert-success">
              Zoom credentials are configured. You can update them below.
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="alert alert-info">
            <strong>How to get your Zoom credentials:</strong>
            <ol>
              <li>Go to <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer">Zoom Marketplace</a></li>
              <li>Click "Develop" → "Build App"</li>
              <li>Create a "Server-to-Server OAuth" app</li>
              <li>Copy your Account ID, Client ID, and Client Secret</li>
              <li>Add required scopes: meeting:write, meeting:read, webinar:write, webinar:read</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Zoom Account ID *</label>
              <input
                type="text"
                name="zoomAccountId"
                value={zoomCredentials.zoomAccountId}
                onChange={handleChange}
                placeholder="Enter your Zoom Account ID"
                required
              />
            </div>

            <div className="form-group">
              <label>Zoom Client ID *</label>
              <input
                type="text"
                name="zoomClientId"
                value={zoomCredentials.zoomClientId}
                onChange={handleChange}
                placeholder="Enter your Zoom Client ID"
                required
              />
            </div>

            <div className="form-group">
              <label>Zoom Client Secret *</label>
              <input
                type="password"
                name="zoomClientSecret"
                value={zoomCredentials.zoomClientSecret}
                onChange={handleChange}
                placeholder="Enter your Zoom Client Secret"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Credentials'}
            </button>
          </form>
        </div>
    </div>
  );
};

export default Settings;
