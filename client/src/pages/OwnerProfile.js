import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getOwnerToken, getOwnerData, setOwnerData } from '../utils/ownerAuth';
import './Settings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerProfile() {
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile update state
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/owners/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOwnerInfo(response.data.owner);
      setProfileData({
        name: response.data.owner.name,
        email: response.data.owner.email
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getOwnerToken();
      const response = await axios.put(
        `${API_URL}/owners/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOwnerInfo(response.data.owner);
      setOwnerData(response.data.owner);
      setSuccess('Profile updated successfully!');
      setProfileLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = getOwnerToken();
      await axios.put(
        `${API_URL}/owners/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordLoading(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password');
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="page-header">
        <h1>Profile & Settings</h1>
        <button className="btn-secondary" onClick={() => navigate('/owner/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Profile Information */}
      <div className="settings-section">
        <h2>Profile Information</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              required
              disabled={profileLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              required
              disabled={profileLoading}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              value={ownerInfo?.role || ''}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small>Role cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Account Status</label>
            <span className={`status-badge ${ownerInfo?.isActive ? 'status-active' : 'status-inactive'}`}>
              {ownerInfo?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={profileLoading}>
            {profileLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="settings-section">
        <h2>Change Password</h2>

        {passwordError && <div className="error-message">{passwordError}</div>}
        {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              disabled={passwordLoading}
              placeholder="Enter your current password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength="6"
              disabled={passwordLoading}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              disabled={passwordLoading}
              placeholder="Confirm new password"
            />
          </div>

          <div className="password-requirements">
            <p><strong>Password Requirements:</strong></p>
            <ul>
              <li>Minimum 6 characters</li>
              <li>Must match confirmation</li>
            </ul>
          </div>

          <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
            {passwordLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account Information */}
      <div className="settings-section">
        <h2>Account Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Account Created</label>
            <span>{ownerInfo?.createdAt ? new Date(ownerInfo.createdAt).toLocaleString() : 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Last Login</label>
            <span>{ownerInfo?.lastLogin ? new Date(ownerInfo.lastLogin).toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerProfile;
