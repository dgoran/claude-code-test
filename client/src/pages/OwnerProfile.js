import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import axios from 'axios';
import { getOwnerToken, getOwnerData, setOwnerData } from '../utils/ownerAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerProfile() {
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

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
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Profile & Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DashboardIcon />}
          onClick={() => navigate('/owner/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Profile Information
        </Typography>
        <Box component="form" onSubmit={handleProfileSubmit}>
          <TextField
            label="Name"
            name="name"
            value={profileData.name}
            onChange={handleProfileChange}
            required
            fullWidth
            disabled={profileLoading}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={profileData.email}
            onChange={handleProfileChange}
            required
            fullWidth
            disabled={profileLoading}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Role</Typography>
            <TextField
              value={ownerInfo?.role || ''}
              disabled
              fullWidth
              size="small"
              helperText="Role cannot be changed"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Account Status</Typography>
            <Chip
              label={ownerInfo?.isActive ? 'Active' : 'Inactive'}
              color={ownerInfo?.isActive ? 'success' : 'default'}
              size="small"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={profileLoading}
          >
            {profileLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Change Password
        </Typography>

        {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
        {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}

        <Box component="form" onSubmit={handlePasswordSubmit}>
          <TextField
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            fullWidth
            disabled={passwordLoading}
            placeholder="Enter your current password"
            sx={{ mb: 2 }}
          />

          <TextField
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            fullWidth
            disabled={passwordLoading}
            placeholder="Enter new password (min 6 characters)"
            inputProps={{ minLength: 6 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            fullWidth
            disabled={passwordLoading}
            placeholder="Confirm new password"
            sx={{ mb: 2 }}
          />

          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Password Requirements:
            </Typography>
            <Box component="ul" sx={{ pl: 2, my: 0 }}>
              <li><Typography variant="body2">Minimum 6 characters</Typography></li>
              <li><Typography variant="body2">Must match confirmation</Typography></li>
            </Box>
          </Paper>

          <Button
            type="submit"
            variant="contained"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Account Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Account Created</Typography>
            <Typography variant="body1">
              {ownerInfo?.createdAt ? new Date(ownerInfo.createdAt).toLocaleString() : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Last Login</Typography>
            <Typography variant="body1">
              {ownerInfo?.lastLogin ? new Date(ownerInfo.lastLogin).toLocaleString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default OwnerProfile;
