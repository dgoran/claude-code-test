import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  EventAvailable as EventIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { getPublicMeeting } from '../utils/api';

const LandingPage = () => {
  const { subdomain, meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeetingData();
  }, [subdomain, meetingId]);

  const loadMeetingData = async () => {
    try {
      const response = await getPublicMeeting(subdomain, meetingId);
      setMeeting(response.data.meeting);
      setOrganization(response.data.organization);
    } catch (err) {
      setError('Meeting not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading...</Typography>
        </Box>
      </Box>
    );
  }

  if (error || !meeting) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h1" component="h1" fontWeight="bold" sx={{ fontSize: '6rem' }}>
            404
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {error || 'Meeting not found'}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" fontWeight="bold">
            {organization?.organizationName}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Chip
            label={meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'}
            color="primary"
            sx={{ mb: 2 }}
          />
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            {meeting.landingPageTitle || meeting.meetingName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {meeting.landingPageDescription || meeting.description}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Date & Time
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(meeting.startTime).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Duration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {meeting.duration} minutes
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <PublicIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Timezone
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {meeting.timezone}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Button
            component={RouterLink}
            to={`/${subdomain}/${meetingId}/register`}
            variant="contained"
            size="large"
            sx={{ px: 6, py: 1.5 }}
          >
            Register Now
          </Button>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Powered by Zoom Registration Platform
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
