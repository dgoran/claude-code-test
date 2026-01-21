import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getOwnerToken } from '../utils/ownerAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerAllMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, meetingId: null, meetingName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, [pagination.page, searchTerm]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/meetings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      setMeetings(response.data.meetings);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleDeleteClick = (meetingId, meetingName) => {
    setDeleteDialog({ open: true, meetingId, meetingName });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getOwnerToken();
      await axios.delete(`${API_URL}/admin/meetings/${deleteDialog.meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meeting deleted successfully');
      fetchMeetings();
    } catch (err) {
      console.error('Error deleting meeting:', err);
      alert('Failed to delete meeting');
    } finally {
      setDeleteDialog({ open: false, meetingId: null, meetingName: '' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          All Meetings
        </Typography>
        <Button
          variant="contained"
          startIcon={<DashboardIcon />}
          onClick={() => navigate('/owner/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading meetings...</Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Meeting Name</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell align="center">Registrants</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meetings.length > 0 ? (
                  meetings.map((meeting) => (
                    <TableRow key={meeting._id}>
                      <TableCell>
                        <Typography fontWeight="bold">{meeting.meetingName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => navigate(`/owner/organizations/${meeting.organizationId._id}`)}
                          sx={{ textAlign: 'left' }}
                        >
                          {meeting.organizationId.organizationName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{new Date(meeting.startTime).toLocaleString()}</TableCell>
                      <TableCell align="center">{meeting.registrantCount || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={meeting.isActive ? 'Active' : 'Inactive'}
                          color={meeting.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(meeting.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteClick(meeting._id, meeting.meetingName)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No meetings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
              <Button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Typography>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </Typography>
              <Button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </Box>
          )}
        </>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, meetingId: null, meetingName: '' })}
      >
        <DialogTitle>Delete Meeting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to DELETE "{deleteDialog.meetingName}"?
            <br /><br />
            This will permanently delete:
            <br />- The meeting
            <br />- All registrants for this meeting
            <br /><br />
            <strong>This action CANNOT be undone!</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, meetingId: null, meetingName: '' })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OwnerAllMeetings;
