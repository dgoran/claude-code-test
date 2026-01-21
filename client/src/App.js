import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import CreateMeeting from './pages/CreateMeeting';
import EditMeeting from './pages/EditMeeting';
import MeetingDetails from './pages/MeetingDetails';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import RegistrationForm from './pages/RegistrationForm';
import PrivateRoute from './components/PrivateRoute';

// Owner Portal Components
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerOrganizations from './pages/OwnerOrganizations';
import OwnerOrganizationDetails from './pages/OwnerOrganizationDetails';
import OwnerAllMeetings from './pages/OwnerAllMeetings';
import OwnerAllRegistrants from './pages/OwnerAllRegistrants';
import OwnerProfile from './pages/OwnerProfile';
import OwnerZoomSettings from './pages/OwnerZoomSettings';
import OwnerPrivateRoute from './components/OwnerPrivateRoute';
import OwnerNavbar from './components/OwnerNavbar';
import Navbar from './components/Navbar';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

        {/* Protected Organization Routes */}
        <Route path="/dashboard" element={<PrivateRoute><><Navbar /><Dashboard /></></PrivateRoute>} />
        <Route path="/meetings" element={<PrivateRoute><><Navbar /><Meetings /></></PrivateRoute>} />
        <Route path="/meetings/create" element={<PrivateRoute><><Navbar /><CreateMeeting /></></PrivateRoute>} />
        <Route path="/meetings/:id/edit" element={<PrivateRoute><><Navbar /><EditMeeting /></></PrivateRoute>} />
        <Route path="/meetings/:id" element={<PrivateRoute><><Navbar /><MeetingDetails /></></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><><Navbar /><Settings /></></PrivateRoute>} />

        {/* Owner Portal Routes */}
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/dashboard" element={<OwnerPrivateRoute><><OwnerNavbar /><OwnerDashboard /></></OwnerPrivateRoute>} />
        <Route path="/owner/organizations" element={<OwnerPrivateRoute><><OwnerNavbar /><OwnerOrganizations /></></OwnerPrivateRoute>} />
        <Route path="/owner/organizations/:id" element={<OwnerPrivateRoute><><OwnerNavbar /><OwnerOrganizationDetails /></></OwnerPrivateRoute>} />
        <Route path="/owner/meetings" element={<OwnerPrivateRoute><><OwnerNavbar /><OwnerAllMeetings /></></OwnerPrivateRoute>} />
        <Route path="/owner/registrants" element={<OwnerPrivateRoute><><OwnerNavbar /><OwnerAllRegistrants /></></OwnerPrivateRoute>} />
        <Route path="/owner/zoom-settings" element={<OwnerPrivateRoute><><OwnerNavbar /><OwnerZoomSettings /></></OwnerPrivateRoute>} />
        <Route path="/owner/profile" element={<OwnerPrivateRoute><><OwnerNavbar /><OwnerProfile /></></OwnerPrivateRoute>} />

        {/* Public Landing and Registration Pages */}
        <Route path="/:subdomain/:meetingId" element={<LandingPage />} />
        <Route path="/:subdomain/:meetingId/register" element={<RegistrationForm />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
