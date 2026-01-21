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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getMeetings, deleteMeeting } from '../utils/api';
import { getOrganization } from '../utils/auth';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const organization = getOrganization();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await getMeetings();
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (meeting) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMeeting(meetingToDelete._id);
      setMeetings(meetings.filter(m => m._id !== meetingToDelete._id));
      setSnackbar({ open: true, message: 'Meeting deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete meeting', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };

  const copyLink = async (meetingId) => {
    const link = `${window.location.origin}/${organization.subdomain}/${meetingId}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
        } catch (err) {
          setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' });
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading meetings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          My Meetings & Webinars
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

      {meetings.length > 0 ? (
        <Grid container spacing={3}>
          {meetings.map((meeting) => (
            <Grid item xs={12} md={6} key={meeting._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" component="h3" fontWeight="bold">
                      {meeting.meetingName}
                    </Typography>
                    <Chip
                      label={meeting.isActive ? 'Active' : 'Inactive'}
                      color={meeting.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {new Date(meeting.startTime).toLocaleString()} • {meeting.duration} min
                  </Typography>
                  {meeting.description && (
                    <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                      {meeting.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Button
                      component={RouterLink}
                      to={`/meetings/${meeting._id}`}
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      size="small"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => copyLink(meeting._id)}
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      size="small"
                    >
                      Copy Link
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(meeting)}
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      size="small"
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            No meetings yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first meeting or webinar to get started
          </Typography>
          <Button
            component={RouterLink}
            to="/meetings/create"
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
          >
            Create Meeting
          </Button>
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Meeting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{meetingToDelete?.meetingName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Meetings;
