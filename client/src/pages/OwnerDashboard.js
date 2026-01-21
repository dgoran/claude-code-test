import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Event as EventIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
  VideoCall as VideoCallIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getOwnerToken, getOwnerData } from '../utils/ownerAuth';

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
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Total Organizations',
      value: stats?.summary?.organizations?.total || 0,
      detail: `${stats?.summary?.organizations?.active || 0} active, ${stats?.summary?.organizations?.inactive || 0} inactive`,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: 'primary.main',
    },
    {
      title: 'Total Meetings',
      value: stats?.summary?.meetings?.total || 0,
      detail: `${stats?.summary?.meetings?.active || 0} active meetings`,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: 'info.main',
    },
    {
      title: 'Total Registrants',
      value: stats?.summary?.registrants?.total || 0,
      detail: `${stats?.summary?.registrants?.syncRate}% synced to Zoom`,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'success.main',
    },
    {
      title: 'Zoom Synced',
      value: stats?.summary?.registrants?.syncedToZoom || 0,
      detail: 'Successfully synced registrations',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: 'secondary.main',
    },
  ];

  const quickActions = [
    {
      label: 'Manage Organizations',
      icon: <BusinessIcon />,
      onClick: () => navigate('/owner/organizations'),
    },
    {
      label: 'View All Meetings',
      icon: <EventIcon />,
      onClick: () => navigate('/owner/meetings'),
    },
    {
      label: 'View All Registrants',
      icon: <PeopleIcon />,
      onClick: () => navigate('/owner/registrants'),
    },
    {
      label: 'Zoom API Settings',
      icon: <VideoCallIcon />,
      onClick: () => navigate('/owner/zoom-settings'),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Website Owner Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Welcome back, {ownerData?.name}!
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {stat.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.detail}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Top Organizations by Registrants
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organization Name</TableCell>
                <TableCell>Subdomain</TableCell>
                <TableCell align="right">Registrants</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats?.topOrganizations?.length > 0 ? (
                stats.topOrganizations.map((org) => (
                  <TableRow key={org._id}>
                    <TableCell>{org.organizationName}</TableCell>
                    <TableCell>
                      <Chip label={org.subdomain} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{org.registrants}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Recent Organizations
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organization Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subdomain</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats?.recentOrganizations?.length > 0 ? (
                stats.recentOrganizations.map((org) => (
                  <TableRow key={org._id}>
                    <TableCell>{org.organizationName}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>
                      <Chip label={org.subdomain} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={org.isActive ? 'Active' : 'Inactive'}
                        color={org.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/owner/organizations/${org._id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No organizations yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={action.icon}
                onClick={action.onClick}
                sx={{ py: 2, justifyContent: 'flex-start' }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
}

export default OwnerDashboard;
