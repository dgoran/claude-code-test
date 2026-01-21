import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
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

function OwnerOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orgId: null, orgName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const token = getOwnerToken();
      const response = await axios.get(`${API_URL}/admin/organizations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: statusFilter
        }
      });
      setOrganizations(response.data.organizations);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Failed to load organizations');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleToggleStatus = async (orgId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this organization?`)) {
      return;
    }

    try {
      const token = getOwnerToken();
      await axios.put(
        `${API_URL}/admin/organizations/${orgId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrganizations();
    } catch (err) {
      console.error('Error updating organization:', err);
      alert('Failed to update organization status');
    }
  };

  const handleDeleteClick = (orgId, orgName) => {
    setDeleteDialog({ open: true, orgId, orgName });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getOwnerToken();
      await axios.delete(`${API_URL}/admin/organizations/${deleteDialog.orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrganizations();
      alert('Organization deleted successfully');
    } catch (err) {
      console.error('Error deleting organization:', err);
      alert('Failed to delete organization');
    } finally {
      setDeleteDialog({ open: false, orgId: null, orgName: '' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Manage Organizations
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, email, or subdomain..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={handleStatusFilter}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading organizations...</Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Organization Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subdomain</TableCell>
                  <TableCell align="center">Meetings</TableCell>
                  <TableCell align="center">Registrants</TableCell>
                  <TableCell align="center">Zoom Sync</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organizations.length > 0 ? (
                  organizations.map((org) => (
                    <TableRow key={org._id}>
                      <TableCell>
                        <Typography fontWeight="bold">{org.organizationName}</Typography>
                      </TableCell>
                      <TableCell>{org.email}</TableCell>
                      <TableCell>
                        <Chip label={org.subdomain} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">{org.stats.meetings}</TableCell>
                      <TableCell align="center">{org.stats.registrants}</TableCell>
                      <TableCell align="center">
                        {org.stats.registrants > 0 ? (
                          <Typography variant="body2">
                            {org.stats.syncedToZoom} / {org.stats.registrants}
                            {org.stats.hasZoomCredentials ? ' ✓' : ' ⚠'}
                          </Typography>
                        ) : (
                          '-'
                        )}
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
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/owner/organizations/${org._id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color={org.isActive ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(org._id, org.isActive)}
                          >
                            {org.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteClick(org._id, org.organizationName)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No organizations found
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
        onClose={() => setDeleteDialog({ open: false, orgId: null, orgName: '' })}
      >
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to DELETE "{deleteDialog.orgName}"?
            <br /><br />
            This will permanently delete:
            <br />- The organization
            <br />- All meetings
            <br />- All registrants
            <br /><br />
            <strong>This action CANNOT be undone!</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, orgId: null, orgName: '' })}>
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

export default OwnerOrganizations;
