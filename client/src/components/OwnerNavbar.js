import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { ownerLogout, getOwnerData } from '../utils/ownerAuth';

function OwnerNavbar() {
  const navigate = useNavigate();
  const ownerData = getOwnerData();

  const handleLogout = () => {
    ownerLogout();
    navigate('/owner/login');
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: 2 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/owner/dashboard"
          sx={{
            flexGrow: 0,
            mr: 4,
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Zoom Registration - Owner Portal
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1 }}>
          <Button
            component={RouterLink}
            to="/owner/dashboard"
            sx={{ color: 'white' }}
          >
            Dashboard
          </Button>
          <Button
            component={RouterLink}
            to="/owner/organizations"
            sx={{ color: 'white' }}
          >
            Organizations
          </Button>
          <Button
            component={RouterLink}
            to="/owner/meetings"
            sx={{ color: 'white' }}
          >
            All Meetings
          </Button>
          <Button
            component={RouterLink}
            to="/owner/registrants"
            sx={{ color: 'white' }}
          >
            All Registrants
          </Button>
          <Button
            component={RouterLink}
            to="/owner/zoom-settings"
            sx={{ color: 'white' }}
          >
            Zoom Settings
          </Button>
          <Button
            component={RouterLink}
            to="/owner/profile"
            sx={{ color: 'white' }}
          >
            Profile
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            label={`${ownerData?.name} (Owner)`}
            sx={{ color: 'white', borderColor: 'white' }}
            variant="outlined"
          />
          <Button
            onClick={handleLogout}
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default OwnerNavbar;
