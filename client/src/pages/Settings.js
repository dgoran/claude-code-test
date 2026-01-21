import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
} from '@mui/material';
import { getProfile, updateZoomCredentials } from '../utils/api';
import { setOrganization } from '../utils/auth';

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

      const updatedProfile = { ...profile, hasZoomCredentials: true };
      setProfile(updatedProfile);
      setOrganization(updatedProfile);

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
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading settings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
          Organization Information
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Organization Name"
              secondary={profile?.organizationName}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Email"
              secondary={profile?.email}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Subdomain"
              secondary={profile?.subdomain}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Member Since"
              secondary={new Date(profile?.createdAt).toLocaleDateString()}
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
          Zoom API Credentials
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure your Zoom API credentials to automatically sync registrants to your Zoom meetings and webinars.
          These credentials are stored securely and are only used for API integration.
        </Typography>

        {profile?.hasZoomCredentials && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Zoom credentials are configured. You can update them below.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>How to get your Zoom credentials:</AlertTitle>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              Go to{' '}
              <Link href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer">
                Zoom Marketplace
              </Link>
            </li>
            <li>Click "Develop" → "Build App"</li>
            <li>Create a "Server-to-Server OAuth" app</li>
            <li>Copy your Account ID, Client ID, and Client Secret</li>
            <li>Add required scopes: meeting:write, meeting:read, webinar:write, webinar:read</li>
          </ol>
        </Alert>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Zoom Account ID"
            name="zoomAccountId"
            value={zoomCredentials.zoomAccountId}
            onChange={handleChange}
            placeholder="Enter your Zoom Account ID"
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Zoom Client ID"
            name="zoomClientId"
            value={zoomCredentials.zoomClientId}
            onChange={handleChange}
            placeholder="Enter your Zoom Client ID"
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Zoom Client Secret"
            name="zoomClientSecret"
            type="password"
            value={zoomCredentials.zoomClientSecret}
            onChange={handleChange}
            placeholder="Enter your Zoom Client Secret"
            required
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={saving}
            sx={{ mt: 2 }}
          >
            {saving ? 'Saving...' : 'Update Credentials'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
