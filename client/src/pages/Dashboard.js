import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  AlertTitle,
  Link,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  People as PeopleIcon,
  CloudDone as CloudDoneIcon,
  Domain as DomainIcon,
} from '@mui/icons-material';
import { getMeetings, getRegistrants } from '../utils/api';
import { getOrganization } from '../utils/auth';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const organization = getOrganization();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [meetingsRes, registrantsRes] = await Promise.all([
        getMeetings(),
        getRegistrants()
      ]);

      setMeetings(meetingsRes.data.meetings);
      setRegistrants(registrantsRes.data.registrants);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
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

  const activeMeetings = meetings.filter(m => m.isActive);
  const totalRegistrants = registrants.length;
  const syncedRegistrants = registrants.filter(r => r.syncedToZoom).length;

  const stats = [
    {
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      value: activeMeetings.length,
      label: 'Active Meetings',
      color: 'primary.main',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      value: totalRegistrants,
      label: 'Total Registrants',
      color: 'success.main',
    },
    {
      icon: <CloudDoneIcon sx={{ fontSize: 40 }} />,
      value: syncedRegistrants,
      label: 'Synced to Zoom',
      color: 'info.main',
    },
    {
      icon: <DomainIcon sx={{ fontSize: 40 }} />,
      value: organization?.subdomain,
      label: 'Your Subdomain',
      color: 'secondary.main',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Welcome, {organization?.organizationName}
        </Typography>
        <Button
          component={RouterLink}
          to="/meetings/create"
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Create New Meeting
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: stat.color, mr: 2 }}>{stat.icon}</Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          Recent Meetings
        </Typography>
        {meetings.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {meetings.slice(0, 5).map((meeting) => (
              <Card key={meeting._id} variant="outlined">
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" component="h3" fontWeight="bold">
                      {meeting.meetingName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'} •{' '}
                      {new Date(meeting.startTime).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    to={`/meetings/${meeting._id}`}
                    variant="outlined"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No meetings yet. Create your first meeting to get started!
            </Typography>
            <Button
              component={RouterLink}
              to="/meetings/create"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Create Meeting
            </Button>
          </Box>
        )}
      </Paper>

      {!organization?.hasZoomCredentials && (
        <Alert severity="info">
          <AlertTitle>Setup Required</AlertTitle>
          Please add your Zoom API credentials in{' '}
          <Link component={RouterLink} to="/settings" underline="hover">
            Settings
          </Link>{' '}
          to enable automatic registration syncing.
        </Alert>
      )}
    </Container>
  );
};

export default Dashboard;
