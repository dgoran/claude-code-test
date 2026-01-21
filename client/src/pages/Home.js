import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {

  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="hero-section">
          <h1>Zoom Webinar & Meeting Registration Platform</h1>
          <p className="hero-subtitle">
            Create beautiful registration pages for your Zoom meetings and webinars.
            Automatically sync registrants to your Zoom account.
          </p>
          <div className="hero-buttons">
            <Link to="/register">
              <button className="btn btn-primary btn-large">Get Started Free</button>
            </Link>
            <Link to="/login">
              <button className="btn btn-secondary btn-large">Sign In</button>
            </Link>
          </div>
        </div>

        <div className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Easy Setup</h3>
              <p>Create your organization account in minutes and start building registration pages immediately.</p>
            </div>
            <div className="feature-card">
              <h3>Zoom Integration</h3>
              <p>Automatically sync all registrants to your Zoom meetings and webinars via API.</p>
            </div>
            <div className="feature-card">
              <h3>Custom Landing Pages</h3>
              <p>Each meeting gets a beautiful, customizable landing page with registration form.</p>
            </div>
            <div className="feature-card">
              <h3>Multi-Tenant</h3>
              <p>Each organization gets their own subdomain and isolated data management.</p>
            </div>
            <div className="feature-card">
              <h3>Registrant Management</h3>
              <p>View, manage, and export all your registrants from a central dashboard.</p>
            </div>
            <div className="feature-card">
              <h3>API Keys Management</h3>
              <p>Securely store and manage your Zoom API credentials for seamless integration.</p>
            </div>
          </div>
        </div>

        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Your Account</h3>
              <p>Sign up with your organization name and email</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Configure Zoom API</h3>
              <p>Add your Zoom API credentials in settings</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Create Meetings</h3>
              <p>Set up your webinars and meetings</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Share & Register</h3>
              <p>Share your registration page and collect attendees</p>
            </div>
          </div>
        </div>

        {/* Footer with SuperAdmin Link */}
        <footer className="home-footer">
          <div className="footer-content">
            <div className="footer-links">
              <Link to="/owner/login" className="superadmin-link">
                <span className="superadmin-icon">🔐</span>
                <span>SuperAdmin Portal</span>
              </Link>
            </div>
            <p className="footer-copyright">
              © 2024 Zoom Registration Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
