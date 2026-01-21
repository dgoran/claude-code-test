import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  FileDownload as FileDownloadIcon,
  CloudSync as CloudSyncIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getMeeting, getMeetingRegistrants, syncRegistrant, deleteRegistrant } from '../utils/api';
import { getOrganization } from '../utils/auth';

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const organization = getOrganization();
  const [meeting, setMeeting] = useState(null);
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, registrantId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadMeetingData();
  }, [id]);

  const loadMeetingData = async () => {
    try {
      const [meetingRes, registrantsRes] = await Promise.all([
        getMeeting(id),
        getMeetingRegistrants(id)
      ]);

      setMeeting(meetingRes.data.meeting);
      setRegistrants(registrantsRes.data.registrants);
    } catch (error) {
      console.error('Error loading meeting data:', error);
      setSnackbar({ open: true, message: 'Failed to load meeting data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (registrantId) => {
    try {
      await syncRegistrant(registrantId);
      loadMeetingData();
      setSnackbar({ open: true, message: 'Registrant synced successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to sync registrant', severity: 'error' });
    }
  };

  const handleDeleteClick = (registrantId) => {
    setDeleteDialog({ open: true, registrantId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteRegistrant(deleteDialog.registrantId);
      setRegistrants(registrants.filter(r => r._id !== deleteDialog.registrantId));
      setSnackbar({ open: true, message: 'Registrant deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete registrant', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, registrantId: null });
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/${organization.subdomain}/${meeting._id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        setSnackbar({ open: true, message: 'Registration link copied to clipboard!', severity: 'success' });
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setSnackbar({ open: true, message: 'Registration link copied to clipboard!', severity: 'success' });
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

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Registered At', 'Synced to Zoom'];
    const rows = registrants.map(r => [
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      r.company,
      r.jobTitle,
      new Date(r.registeredAt).toLocaleString(),
      r.syncedToZoom ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrants-${meeting.meetingName}-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading meeting details...</Typography>
      </Container>
    );
  }

  if (!meeting) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Meeting not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/meetings')}
        sx={{ mb: 3 }}
      >
        Back to Meetings
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {meeting.meetingName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'} •{' '}
            {new Date(meeting.startTime).toLocaleString()} •{' '}
            {meeting.duration} minutes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/meetings/${id}/edit`)}
        >
          Edit Meeting
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
          Meeting Information
        </Typography>
        {meeting.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
              Description:
            </Typography>
            <Typography variant="body1">{meeting.description}</Typography>
          </Box>
        )}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="bold">
            Timezone:
          </Typography>
          <Typography variant="body1">{meeting.timezone}</Typography>
        </Box>
        {meeting.zoomMeetingId && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
              Zoom Meeting ID:
            </Typography>
            <Typography variant="body1">{meeting.zoomMeetingId}</Typography>
          </Box>
        )}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ mb: 1 }}>
            Registration Link:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={`${window.location.origin}/${organization.subdomain}/${meeting._id}`}
              fullWidth
              InputProps={{ readOnly: true }}
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={copyLink}
            >
              Copy Link
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h3" fontWeight="bold">
            Registrants ({registrants.length})
          </Typography>
          {registrants.length > 0 && (
            <Button
              variant="contained"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={exportCSV}
            >
              Export CSV
            </Button>
          )}
        </Box>

        {registrants.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>Zoom Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrants.map((registrant) => (
                  <TableRow key={registrant._id}>
                    <TableCell>{registrant.firstName} {registrant.lastName}</TableCell>
                    <TableCell>{registrant.email}</TableCell>
                    <TableCell>{registrant.phone || '-'}</TableCell>
                    <TableCell>{registrant.company || '-'}</TableCell>
                    <TableCell>{new Date(registrant.registeredAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {registrant.syncedToZoom ? (
                        <Chip label="Synced" color="success" size="small" />
                      ) : (
                        <Chip label="Not Synced" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {!registrant.syncedToZoom && meeting.zoomMeetingId && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CloudSyncIcon />}
                            onClick={() => handleSync(registrant._id)}
                          >
                            Sync
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(registrant._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No registrants yet. Share your registration link to get started!
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, registrantId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this registrant? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, registrantId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MeetingDetails;
