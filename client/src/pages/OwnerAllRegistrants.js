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

function OwnerAllRegistrants() {
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, registrantId: null, registrantName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrants();
  }, [pagination.page, searchTerm]);

  const fetchRegistrants = async () => {
    try {
      setLoading(true);
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/registrants`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      setRegistrants(response.data.registrants);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching registrants:', err);
      setError('Failed to load registrants');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleDeleteClick = (registrantId, registrantName) => {
    setDeleteDialog({ open: true, registrantId, registrantName });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getOwnerToken();
      await axios.delete(`${API_URL}/admin/registrants/${deleteDialog.registrantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Registrant deleted successfully');
      fetchRegistrants();
    } catch (err) {
      console.error('Error deleting registrant:', err);
      alert('Failed to delete registrant');
    } finally {
      setDeleteDialog({ open: false, registrantId: null, registrantName: '' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          All Registrants
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
          placeholder="Search by name or email..."
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
          <Typography sx={{ mt: 2 }}>Loading registrants...</Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Meeting</TableCell>
                  <TableCell>Zoom Status</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrants.length > 0 ? (
                  registrants.map((registrant) => (
                    <TableRow key={registrant._id}>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {registrant.firstName} {registrant.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{registrant.email}</TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => navigate(`/owner/organizations/${registrant.organizationId._id}`)}
                          sx={{ textAlign: 'left' }}
                        >
                          {registrant.organizationId.organizationName}
                        </Link>
                      </TableCell>
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
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteClick(registrant._id, `${registrant.firstName} ${registrant.lastName}`)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No registrants found
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
        onClose={() => setDeleteDialog({ open: false, registrantId: null, registrantName: '' })}
      >
        <DialogTitle>Delete Registrant</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to DELETE registrant "{deleteDialog.registrantName}"?
            <br /><br />
            <strong>This action CANNOT be undone!</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, registrantId: null, registrantName: '' })}>
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

export default OwnerAllRegistrants;
