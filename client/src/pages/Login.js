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
import { loginOrganization } from '../utils/api';
import { setToken, setOrganization } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    try {
      const response = await loginOrganization(formData);
      setToken(response.data.token);
      setOrganization(response.data.organization);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
                Sign In to Your Account
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                Manage your meetings and registrants
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
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
                  placeholder="Enter your password"
                  required
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
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Box>

              <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" underline="hover">
                  Create One
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default Login;
