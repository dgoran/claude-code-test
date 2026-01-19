import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getOrganization } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const organization = getOrganization();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="nav">
        <Link to={isAuthenticated() ? '/dashboard' : '/'} className="nav-brand">
          Zoom Registration
        </Link>
        <div className="nav-links">
          {isAuthenticated() ? (
            <>
              <span>Welcome, {organization?.organizationName || 'User'}</span>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/meetings">Meetings</Link>
              <Link to="/settings">Settings</Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">
                <button className="btn btn-primary">Get Started</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
