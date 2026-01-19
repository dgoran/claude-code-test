import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import CreateMeeting from './pages/CreateMeeting';
import MeetingDetails from './pages/MeetingDetails';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import RegistrationForm from './pages/RegistrationForm';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/meetings" element={<PrivateRoute><Meetings /></PrivateRoute>} />
        <Route path="/meetings/create" element={<PrivateRoute><CreateMeeting /></PrivateRoute>} />
        <Route path="/meetings/:id" element={<PrivateRoute><MeetingDetails /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

        {/* Public Landing and Registration Pages */}
        <Route path="/:subdomain/:meetingId" element={<LandingPage />} />
        <Route path="/:subdomain/:meetingId/register" element={<RegistrationForm />} />
      </Routes>
    </Router>
  );
}

export default App;
