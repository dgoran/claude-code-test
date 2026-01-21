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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getOwnerToken } from '../utils/ownerAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerZoomSettings() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [editingOrg, setEditingOrg] = useState(null);
  const [zoomCredentials, setZoomCredentials] = useState({
    zoomAccountId: '',
    zoomClientId: '',
    zoomClientSecret: ''
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, [pagination.page, searchTerm]);

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
          status: 'all'
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

  const handleEditZoom = async (orgId) => {
    try {
      const token = getOwnerToken();
      const response = await axios.get(
        `${API_URL}/admin/organizations/${orgId}/zoom-credentials`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setZoomCredentials({
        zoomAccountId: response.data.zoomAccountId,
        zoomClientId: response.data.zoomClientId,
        zoomClientSecret: response.data.zoomClientSecret
      });
      setEditingOrg(response.data);
    } catch (err) {
      console.error('Error fetching Zoom credentials:', err);
      alert('Failed to load Zoom credentials');
    }
  };

  const handleSaveZoom = async () => {
    if (!editingOrg) return;

    try {
      setSaving(true);
      const token = getOwnerToken();
      await axios.put(
        `${API_URL}/admin/organizations/${editingOrg.organizationId}/zoom-credentials`,
        zoomCredentials,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Zoom credentials updated successfully');
      setEditingOrg(null);
      setZoomCredentials({ zoomAccountId: '', zoomClientId: '', zoomClientSecret: '' });
      fetchOrganizations();
    } catch (err) {
      console.error('Error updating Zoom credentials:', err);
      alert('Failed to update Zoom credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrg(null);
    setZoomCredentials({ zoomAccountId: '', zoomClientId: '', zoomClientSecret: '' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Zoom API Settings
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
          placeholder="Search by organization name or subdomain..."
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
          <Typography sx={{ mt: 2 }}>Loading organizations...</Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Organization Name</TableCell>
                  <TableCell>Subdomain</TableCell>
                  <TableCell>Zoom Account ID</TableCell>
                  <TableCell>Zoom Client ID</TableCell>
                  <TableCell>Status</TableCell>
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
                      <TableCell>
                        <Chip label={org.subdomain} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {org.zoomAccountId ? (
                          <Typography variant="body2" title={org.zoomAccountId}>
                            {org.zoomAccountId.substring(0, 15)}...
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not set</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {org.zoomClientId ? (
                          <Typography variant="body2" title={org.zoomClientId}>
                            {org.zoomClientId.substring(0, 15)}...
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not set</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={org.stats.hasZoomCredentials ? 'Configured' : 'Not Configured'}
                          color={org.stats.hasZoomCredentials ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditZoom(org._id)}
                        >
                          Edit Credentials
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
        open={!!editingOrg}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Zoom Credentials</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Organization: <strong>{editingOrg?.organizationName}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
              Subdomain: <Chip label={editingOrg?.subdomain} size="small" variant="outlined" />
            </Typography>

            <TextField
              label="Zoom Account ID"
              value={zoomCredentials.zoomAccountId}
              onChange={(e) => setZoomCredentials({ ...zoomCredentials, zoomAccountId: e.target.value })}
              placeholder="Enter Zoom Account ID"
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Zoom Client ID"
              value={zoomCredentials.zoomClientId}
              onChange={(e) => setZoomCredentials({ ...zoomCredentials, zoomClientId: e.target.value })}
              placeholder="Enter Zoom Client ID"
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Zoom Client Secret"
              type="password"
              value={zoomCredentials.zoomClientSecret}
              onChange={(e) => setZoomCredentials({ ...zoomCredentials, zoomClientSecret: e.target.value })}
              placeholder="Enter Zoom Client Secret"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSaveZoom} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Credentials'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OwnerZoomSettings;
