import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { getPublicMeeting, registerForMeeting } from '../utils/api';

const RegistrationForm = () => {
  const { subdomain, meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadMeetingData();
  }, [subdomain, meetingId]);

  const loadMeetingData = async () => {
    try {
      const response = await getPublicMeeting(subdomain, meetingId);
      const meetingData = response.data.meeting;
      setMeeting(meetingData);
      setOrganization(response.data.organization);

      // Initialize form data based on form fields
      const initialFormData = {};
      if (meetingData.formFields && meetingData.formFields.length > 0) {
        meetingData.formFields.forEach(field => {
          initialFormData[field.fieldName] = '';
        });
      } else {
        // Default fields if no form fields configured
        initialFormData.firstName = '';
        initialFormData.lastName = '';
        initialFormData.email = '';
        initialFormData.phone = '';
        initialFormData.company = '';
        initialFormData.jobTitle = '';
      }
      setFormData(initialFormData);
    } catch (err) {
      setError('Meeting not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await registerForMeeting({
        subdomain,
        meetingId,
        ...formData
      });

      setRegistrationData(response.data.registrant);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormFields = () => {
    const formFields = meeting?.formFields || [];

    // If no form fields configured, show default fields
    if (formFields.length === 0) {
      return (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Enter your first name"
            />

            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Enter your last name"
            />
          </Box>

          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
            fullWidth
            placeholder="Enter your email address"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={handleChange}
            fullWidth
            placeholder="Enter your phone number (optional)"
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Company"
              name="company"
              value={formData.company || ''}
              onChange={handleChange}
              fullWidth
              placeholder="Enter your company name (optional)"
            />

            <TextField
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle || ''}
              onChange={handleChange}
              fullWidth
              placeholder="Enter your job title (optional)"
            />
          </Box>
        </>
      );
    }

    // Render dynamic fields
    return formFields.map((field, index) => {
      const isTextarea = field.fieldType === 'textarea';
      const commonProps = {
        name: field.fieldName,
        value: formData[field.fieldName] || '',
        onChange: handleChange,
        placeholder: `Enter ${field.fieldLabel.toLowerCase()}`,
        required: field.isRequired,
        fullWidth: true,
      };

      return (
        <Box key={index} sx={{ mb: 2 }}>
          <TextField
            {...commonProps}
            label={field.fieldLabel}
            type={isTextarea ? 'text' : field.fieldType}
            multiline={isTextarea}
            rows={isTextarea ? 4 : undefined}
            helperText={field.fieldName === 'email' ? "You'll receive confirmation and join details at this email" : undefined}
          />
        </Box>
      );
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !meeting) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: '72px', mb: 2 }}>404</Typography>
            <Typography variant="h6" color="text.secondary">{error}</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for registering, {registrationData?.firstName}!
            </Typography>

            <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  What's Next?
                </Typography>
                <Box component="ul" sx={{ textAlign: 'left', pl: 3 }}>
                  <li>
                    <Typography variant="body2">
                      Check your email ({registrationData?.email}) for confirmation
                    </Typography>
                  </li>
                  {registrationData?.zoomJoinUrl && (
                    <li>
                      <Typography variant="body2">
                        Save your unique join link (sent to your email)
                      </Typography>
                    </li>
                  )}
                  {registrationData?.syncedToZoom ? (
                    <li>
                      <Typography variant="body2">
                        You've been successfully added to the Zoom {meeting.meetingType}
                      </Typography>
                    </li>
                  ) : (
                    <li>
                      <Typography variant="body2">
                        You'll receive Zoom meeting details shortly
                      </Typography>
                    </li>
                  )}
                  <li>
                    <Typography variant="body2">
                      Add the event to your calendar
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {meeting.meetingName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(meeting.startTime).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {meeting.duration} minutes • {meeting.timezone}
              </Typography>
            </Paper>

            <Button
              component={RouterLink}
              to={`/${subdomain}/${meetingId}`}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
            >
              Back to Event Page
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button
            component={RouterLink}
            to={`/${subdomain}/${meetingId}`}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Event Details
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {organization?.organizationName}
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Chip
              label={meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'}
              color="primary"
              size="small"
              icon={<EventIcon />}
              sx={{ mb: 2 }}
            />
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              {meeting.meetingName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {new Date(meeting.startTime).toLocaleString()}
            </Typography>
          </Box>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 3 }}>
            Register for this Event
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {renderFormFields()}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={20} />}
              sx={{ mt: 3 }}
            >
              {submitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          </Box>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Powered by Zoom Registration Platform
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegistrationForm;
