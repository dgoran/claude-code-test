import axios from 'axios';
import { getToken } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Organizations
export const registerOrganization = (data) => api.post('/organizations/register', data);
export const loginOrganization = (data) => api.post('/organizations/login', data);
export const getProfile = () => api.get('/organizations/profile');
export const updateZoomCredentials = (data) => api.put('/organizations/zoom-credentials', data);
export const getOrganizationBySubdomain = (subdomain) => api.get(`/organizations/subdomain/${subdomain}`);

// Meetings
export const createMeeting = (data) => api.post('/meetings', data);
export const getMeetings = () => api.get('/meetings');
export const getMeeting = (id) => api.get(`/meetings/${id}`);
export const getPublicMeeting = (subdomain, meetingId) => api.get(`/meetings/public/${subdomain}/${meetingId}`);
export const updateMeeting = (id, data) => api.put(`/meetings/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/meetings/${id}`);

// Registrants
export const registerForMeeting = (data) => api.post('/registrants/register', data);
export const getRegistrants = () => api.get('/registrants');
export const getMeetingRegistrants = (meetingId) => api.get(`/registrants/meeting/${meetingId}`);
export const syncRegistrant = (id) => api.post(`/registrants/${id}/sync`);
export const deleteRegistrant = (id) => api.delete(`/registrants/${id}`);

export default api;
