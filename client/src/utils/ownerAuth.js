import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Owner token storage
export const setOwnerToken = (token) => {
  localStorage.setItem('ownerToken', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getOwnerToken = () => {
  return localStorage.getItem('ownerToken');
};

export const removeOwnerToken = () => {
  localStorage.removeItem('ownerToken');
  delete axios.defaults.headers.common['Authorization'];
};

// Owner data storage
export const setOwnerData = (owner) => {
  localStorage.setItem('ownerData', JSON.stringify(owner));
};

export const getOwnerData = () => {
  const data = localStorage.getItem('ownerData');
  return data ? JSON.parse(data) : null;
};

export const removeOwnerData = () => {
  localStorage.removeItem('ownerData');
};

// Check if owner is authenticated
export const isOwnerAuthenticated = () => {
  const token = getOwnerToken();
  return !!token;
};

// Owner login
export const ownerLogin = async (email, password) => {
  const response = await axios.post(`${API_URL}/owners/login`, { email, password });
  const { token, owner } = response.data;

  setOwnerToken(token);
  setOwnerData(owner);

  return { token, owner };
};

// Owner logout
export const ownerLogout = () => {
  removeOwnerToken();
  removeOwnerData();
};

// Get owner profile
export const getOwnerProfile = async () => {
  const token = getOwnerToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await axios.get(`${API_URL}/owners/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data.owner;
};

// Initialize axios with owner token if exists
const token = getOwnerToken();
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default {
  setOwnerToken,
  getOwnerToken,
  removeOwnerToken,
  setOwnerData,
  getOwnerData,
  removeOwnerData,
  isOwnerAuthenticated,
  ownerLogin,
  ownerLogout,
  getOwnerProfile
};
