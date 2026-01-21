import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import FormBuilder from '../components/FormBuilder';
import { getMeeting, updateMeeting } from '../utils/api';
import { getOrganization } from '../utils/auth';

const EditMeeting = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const organization = getOrganization();
  const [formData, setFormData] = useState({
    meetingName: '',
    meetingType: 'meeting',
    description: '',
    startTime: '',
    duration: 60,
    timezone: 'UTC',
    landingPageTitle: '',
    landingPageDescription: '',
    isActive: true
  });
  const [formFields, setFormFields] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMeeting, setFetchingMeeting] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await getMeeting(id);
        const meeting = response.data.meeting;

        // Format the date for datetime-local input
        const startTime = meeting.startTime
          ? new Date(meeting.startTime).toISOString().slice(0, 16)
          : '';

        setFormData({
          meetingName: meeting.meetingName || '',
          meetingType: meeting.meetingType || 'meeting',
          description: meeting.description || '',
          startTime,
          duration: meeting.duration || 60,
          timezone: meeting.timezone || 'UTC',
          landingPageTitle: meeting.landingPageTitle || '',
          landingPageDescription: meeting.landingPageDescription || '',
          isActive: meeting.isActive !== undefined ? meeting.isActive : true
        });

        // Set form fields or default to basic fields
        if (meeting.formFields && meeting.formFields.length > 0) {
          setFormFields(meeting.formFields);
        } else {
          setFormFields([
            { fieldName: 'firstName', fieldLabel: 'First Name', fieldType: 'text', isRequired: true, isStandardZoomField: true, zoomFieldKey: 'first_name', options: [], order: 0 },
            { fieldName: 'email', fieldLabel: 'Email', fieldType: 'email', isRequired: true, isStandardZoomField: true, zoomFieldKey: 'email', options: [], order: 1 }
          ]);
        }
      } catch (err) {
        setError('Failed to load meeting details');
      } finally {
        setFetchingMeeting(false);
      }
    };

    fetchMeeting();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.meetingName || !formData.startTime) {
      setError('Please provide meeting name and start time');
      return;
    }

    setLoading(true);

    try {
      await updateMeeting(id, {
        ...formData,
        formFields
      });

      navigate(`/meetings/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingMeeting) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading meeting details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/meetings/${id}`)}
          sx={{ mb: 2 }}
        >
          Back to Meeting Details
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Edit Meeting/Webinar
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <TextField
              label="Meeting Name"
              name="meetingName"
              value={formData.meetingName}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Enter meeting name"
            />

            <TextField
              select
              label="Type"
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              required
              fullWidth
            >
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="webinar">Webinar</MenuItem>
            </TextField>
          </Box>

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            placeholder="Enter meeting description"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
            <TextField
              label="Start Time"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 15, max: 1440 }}
            />

            <TextField
              select
              label="Timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              required
              fullWidth
            >
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="America/New_York">Eastern Time</MenuItem>
              <MenuItem value="America/Chicago">Central Time</MenuItem>
              <MenuItem value="America/Denver">Mountain Time</MenuItem>
              <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
              <MenuItem value="Europe/London">London</MenuItem>
              <MenuItem value="Europe/Paris">Paris</MenuItem>
              <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
            </TextField>
          </Box>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 2 }}>
            Landing Page Customization
          </Typography>

          <TextField
            label="Landing Page Title"
            name="landingPageTitle"
            value={formData.landingPageTitle}
            onChange={handleChange}
            fullWidth
            placeholder="Leave blank to use meeting name"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Landing Page Description"
            name="landingPageDescription"
            value={formData.landingPageDescription}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            placeholder="Custom description for the landing page"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              }
              label="Meeting is active"
            />
          </Box>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 2 }}>
            Registration Form Configuration
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormBuilder formFields={formFields} onChange={setFormFields} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/meetings/${id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Updating...' : 'Update Meeting'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditMeeting;
