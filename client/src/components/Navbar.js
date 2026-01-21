import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { isAuthenticated, logout, getOrganization } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const organization = getOrganization();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: 2 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to={isAuthenticated() ? '/dashboard' : '/'}
          sx={{
            flexGrow: 1,
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Zoom Registration
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isAuthenticated() ? (
            <>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                Welcome, {organization?.organizationName || 'User'}
              </Typography>
              <Button
                component={RouterLink}
                to="/dashboard"
                color="inherit"
              >
                Dashboard
              </Button>
              <Button
                component={RouterLink}
                to="/meetings"
                color="inherit"
              >
                Meetings
              </Button>
              <Button
                component={RouterLink}
                to="/settings"
                color="inherit"
              >
                Settings
              </Button>
              <Button
                onClick={handleLogout}
                variant="contained"
                color="secondary"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
