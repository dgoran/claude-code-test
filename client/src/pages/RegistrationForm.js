import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicMeeting, registerForMeeting } from '../utils/api';
import './RegistrationForm.css';

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
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="Enter your phone number (optional)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                name="company"
                value={formData.company || ''}
                onChange={handleChange}
                placeholder="Enter your company name (optional)"
              />
            </div>

            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle || ''}
                onChange={handleChange}
                placeholder="Enter your job title (optional)"
              />
            </div>
          </div>
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
        required: field.isRequired
      };

      return (
        <div key={index} className="form-group">
          <label>
            {field.fieldLabel} {field.isRequired && '*'}
          </label>
          {isTextarea ? (
            <textarea {...commonProps} rows="4" />
          ) : (
            <input {...commonProps} type={field.fieldType} />
          )}
          {field.fieldName === 'email' && (
            <span className="form-hint">
              You'll receive confirmation and join details at this email
            </span>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="registration-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div className="registration-container">
        <div className="error-page">
          <h1>404</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="registration-container">
        <div className="success-page">
          <div className="success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p className="success-message">
            Thank you for registering, {registrationData?.firstName}!
          </p>

          <div className="success-details">
            <h3>What's Next?</h3>
            <ul>
              <li>Check your email ({registrationData?.email}) for confirmation</li>
              {registrationData?.zoomJoinUrl && (
                <li>Save your unique join link (sent to your email)</li>
              )}
              {registrationData?.syncedToZoom ? (
                <li>You've been successfully added to the Zoom {meeting.meetingType}</li>
              ) : (
                <li>You'll receive Zoom meeting details shortly</li>
              )}
              <li>Add the event to your calendar</li>
            </ul>

            <div className="meeting-summary">
              <h4>{meeting.meetingName}</h4>
              <p>{new Date(meeting.startTime).toLocaleString()}</p>
              <p>{meeting.duration} minutes • {meeting.timezone}</p>
            </div>

            <Link to={`/${subdomain}/${meetingId}`}>
              <button className="btn btn-secondary">Back to Event Page</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-header">
        <Link to={`/${subdomain}/${meetingId}`} className="back-link">
          ← Back to Event Details
        </Link>
        <h1>{organization?.organizationName}</h1>
      </div>

      <div className="registration-content">
        <div className="registration-card">
          <div className="event-summary">
            <span className="event-type">
              {meeting.meetingType === 'webinar' ? 'Webinar' : 'Meeting'}
            </span>
            <h2>{meeting.meetingName}</h2>
            <p className="event-time">
              {new Date(meeting.startTime).toLocaleString()}
            </p>
          </div>

          <h3>Register for this Event</h3>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {renderFormFields()}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>

      <div className="registration-footer">
        <p>Powered by Zoom Registration Platform</p>
      </div>
    </div>
  );
};

export default RegistrationForm;
