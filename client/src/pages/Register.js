import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';
import Navbar from '../components/Navbar';
import { registerOrganization } from '../utils/api';
import { setToken, setOrganization } from '../utils/auth';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    meetingName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await registerOrganization({
        organizationName: formData.organizationName,
        email: formData.email,
        password: formData.password,
        meetingName: formData.meetingName
      });

      setToken(response.data.token);
      setOrganization(response.data.organization);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom fontWeight="bold" textAlign="center">
                Create Your Organization Account
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                Start creating registration pages for your Zoom meetings
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="Enter your organization name"
                  required
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password (min 6 characters)"
                  required
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="First Meeting Name (Optional)"
                  name="meetingName"
                  value={formData.meetingName}
                  onChange={handleChange}
                  placeholder="e.g., Weekly Product Demo"
                  margin="normal"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Box>

              <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" underline="hover">
                  Sign In
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default Register;
