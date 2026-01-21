import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormBuilder from '../components/FormBuilder';
import { getMeeting, updateMeeting } from '../utils/api';
import { getOrganization } from '../utils/auth';
import './CreateMeeting.css';

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
      <div className="container">
        <div className="card">
          <p>Loading meeting details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Edit Meeting/Webinar</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Meeting Name *</label>
                <input
                  type="text"
                  name="meetingName"
                  value={formData.meetingName}
                  onChange={handleChange}
                  placeholder="Enter meeting name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  name="meetingType"
                  value={formData.meetingType}
                  onChange={handleChange}
                  required
                >
                  <option value="meeting">Meeting</option>
                  <option value="webinar">Webinar</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter meeting description"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="15"
                  max="1440"
                  required
                />
              </div>

              <div className="form-group">
                <label>Timezone *</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  required
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>

            <h3>Landing Page Customization</h3>

            <div className="form-group">
              <label>Landing Page Title</label>
              <input
                type="text"
                name="landingPageTitle"
                value={formData.landingPageTitle}
                onChange={handleChange}
                placeholder="Leave blank to use meeting name"
              />
            </div>

            <div className="form-group">
              <label>Landing Page Description</label>
              <textarea
                name="landingPageDescription"
                value={formData.landingPageDescription}
                onChange={handleChange}
                placeholder="Custom description for the landing page"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Meeting is active</span>
              </label>
            </div>

            <h3>Registration Form Configuration</h3>
            <FormBuilder formFields={formFields} onChange={setFormFields} />

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(`/meetings/${id}`)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Meeting'}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default EditMeeting;
