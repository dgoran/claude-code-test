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
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { ownerLogin } from '../utils/ownerAuth';

function OwnerLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await ownerLogin(formData.email, formData.password);
      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <AdminIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                Website Owner Login
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Admin Dashboard Access
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email or Username"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email or username"
                required
                disabled={isLoading}
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
                disabled={isLoading}
                margin="normal"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>

            <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
              <Link component={RouterLink} to="/login" underline="hover">
                Login as Organization
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default OwnerLogin;
