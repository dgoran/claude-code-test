import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getOwnerToken } from '../utils/ownerAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerOrganizationDetails() {
  const { id } = useParams();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizationDetails();
  }, [id]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/organizations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrgData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError('Failed to load organization details');
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(
      `Are you sure you want to ${orgData.organization.isActive ? 'deactivate' : 'activate'} this organization?`
    )) {
      return;
    }

    try {
      const token = getOwnerToken();
      await axios.put(
        `${API_URL}/admin/organizations/${id}`,
        { isActive: !orgData.organization.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrganizationDetails();
    } catch (err) {
      console.error('Error updating organization:', err);
      alert('Failed to update organization status');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading organization details...</Typography>
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

  const { organization, stats, recentMeetings, recentRegistrants, registrationTrend } = orgData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/owner/organizations')}
            sx={{ mb: 2 }}
          >
            Back to Organizations
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {organization.organizationName}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color={organization.isActive ? 'warning' : 'success'}
          onClick={handleToggleStatus}
        >
          {organization.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Organization Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Organization Name:</Typography>
            <Typography variant="body1">{organization.organizationName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Email:</Typography>
            <Typography variant="body1">{organization.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Subdomain:</Typography>
            <Chip label={organization.subdomain} size="small" variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Status:</Typography>
            <Chip
              label={organization.isActive ? 'Active' : 'Inactive'}
              color={organization.isActive ? 'success' : 'default'}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Created:</Typography>
            <Typography variant="body1">{new Date(organization.createdAt).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Zoom Integration:</Typography>
            <Typography variant="body1">{stats.hasZoomCredentials ? '✅ Configured' : '❌ Not Configured'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon sx={{ color: 'primary.main', mr: 1 }} />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.meetings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Meetings
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.activeMeetings} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ color: 'success.main', mr: 1 }} />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.totalRegistrants}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Registrants
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across all meetings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ color: 'info.main', mr: 1 }} />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.syncedToZoom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Zoom Synced
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.syncRate}% sync rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Recent Meetings
        </Typography>
        {recentMeetings.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Meeting Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentMeetings.map((meeting) => (
                  <TableRow key={meeting._id}>
                    <TableCell>{meeting.meetingName}</TableCell>
                    <TableCell>
                      <Chip
                        label={meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{new Date(meeting.startTime).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={meeting.isActive ? 'Active' : 'Inactive'}
                        color={meeting.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">No meetings yet</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Recent Registrants (Last 10)
        </Typography>
        {recentRegistrants.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Meeting</TableCell>
                  <TableCell>Zoom Status</TableCell>
                  <TableCell>Registered</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentRegistrants.map((registrant) => (
                  <TableRow key={registrant._id}>
                    <TableCell>{registrant.firstName} {registrant.lastName}</TableCell>
                    <TableCell>{registrant.email}</TableCell>
                    <TableCell>{registrant.meetingId?.meetingName || 'N/A'}</TableCell>
                    <TableCell>
                      {registrant.syncedToZoom ? (
                        <Chip label="Synced" color="success" size="small" />
                      ) : registrant.syncError ? (
                        <Chip label="Error" color="error" size="small" title={registrant.syncError} />
                      ) : (
                        <Chip label="Pending" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{new Date(registrant.registeredAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">No registrants yet</Typography>
        )}
      </Paper>

      {registrationTrend.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
            Registration Trend (Last 30 Days)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {registrationTrend.map((day) => {
              const maxCount = Math.max(...registrationTrend.map(d => d.count));
              const width = (day.count / maxCount) * 100;
              return (
                <Box key={day._id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                    {new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Typography>
                  <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 1, height: 24, position: 'relative' }}>
                    <Box
                      sx={{
                        width: `${width}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: 1,
                      }}
                    >
                      <Typography variant="body2" color="white" fontWeight="bold">
                        {day.count}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default OwnerOrganizationDetails;
