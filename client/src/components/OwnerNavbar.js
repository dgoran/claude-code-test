import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ownerLogout, getOwnerData } from '../utils/ownerAuth';
import './Navbar.css';

function OwnerNavbar() {
  const navigate = useNavigate();
  const ownerData = getOwnerData();

  const handleLogout = () => {
    ownerLogout();
    navigate('/owner/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/owner/dashboard">Zoom Registration - Owner Portal</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/owner/dashboard" className="navbar-item">Dashboard</Link>
        <Link to="/owner/organizations" className="navbar-item">Organizations</Link>
        <Link to="/owner/meetings" className="navbar-item">All Meetings</Link>
        <Link to="/owner/registrants" className="navbar-item">All Registrants</Link>
        <Link to="/owner/zoom-settings" className="navbar-item">Zoom Settings</Link>
        <Link to="/owner/profile" className="navbar-item">Profile</Link>
        <div className="navbar-user">
          <span className="user-name">{ownerData?.name} (Owner)</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default OwnerNavbar;
