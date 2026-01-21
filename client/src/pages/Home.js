import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Link,
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  IntegrationInstructions as IntegrationIcon,
  Web as WebIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

const Home = () => {
  const features = [
    {
      icon: <CheckIcon sx={{ fontSize: 40 }} />,
      title: 'Easy Setup',
      description: 'Create your organization account in minutes and start building registration pages immediately.',
    },
    {
      icon: <IntegrationIcon sx={{ fontSize: 40 }} />,
      title: 'Zoom Integration',
      description: 'Automatically sync all registrants to your Zoom meetings and webinars via API.',
    },
    {
      icon: <WebIcon sx={{ fontSize: 40 }} />,
      title: 'Custom Landing Pages',
      description: 'Each meeting gets a beautiful, customizable landing page with registration form.',
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-Tenant',
      description: 'Each organization gets their own subdomain and isolated data management.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Registrant Management',
      description: 'View, manage, and export all your registrants from a central dashboard.',
    },
    {
      icon: <VpnKeyIcon sx={{ fontSize: 40 }} />,
      title: 'API Keys Management',
      description: 'Securely store and manage your Zoom API credentials for seamless integration.',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up with your organization name and email',
    },
    {
      number: 2,
      title: 'Configure Zoom API',
      description: 'Add your Zoom API credentials in settings',
    },
    {
      number: 3,
      title: 'Create Meetings',
      description: 'Set up your webinars and meetings',
    },
    {
      number: 4,
      title: 'Share & Register',
      description: 'Share your registration page and collect attendees',
    },
  ];

  return (
    <>
      <Navbar />
      <Box>
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 10,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              Zoom Webinar & Meeting Registration Platform
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
              Create beautiful registration pages for your Zoom meetings and webinars.
              Automatically sync registrants to your Zoom account.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Get Started Free
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Sign In
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Features
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* How It Works Section */}
        <Box sx={{ bgcolor: 'background.default', py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
              How It Works
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {steps.map((step) => (
                <Grid item xs={12} sm={6} md={3} key={step.number}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {step.number}
                    </Avatar>
                    <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            bgcolor: 'background.paper',
            py: 4,
            borderTop: 1,
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Container>
            <Link
              component={RouterLink}
              to="/owner/login"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 500,
              }}
            >
              <span>🔐</span>
              <span>SuperAdmin Portal</span>
            </Link>
            <Typography variant="body2" color="text.secondary">
              © 2024 Zoom Registration Platform. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Home;
