// Authentication utility functions

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const setOrganization = (org) => {
  localStorage.setItem('organization', JSON.stringify(org));
};

export const getOrganization = () => {
  const org = localStorage.getItem('organization');
  return org ? JSON.parse(org) : null;
};

export const removeOrganization = () => {
  localStorage.removeItem('organization');
};

export const logout = () => {
  removeToken();
  removeOrganization();
};
