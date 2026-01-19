# Zoom Webinar & Meeting Registration Platform

A comprehensive multi-tenant web application for managing Zoom meeting and webinar registrations with automatic synchronization to Zoom's API.

## Features

- **Multi-Tenant Architecture**: Each organization gets their own subdomain and isolated data
- **Website Owner Dashboard**: Comprehensive admin portal to manage all tenants and organizations
- **Zoom API Integration**: Automatically sync registrants to Zoom meetings and webinars
- **Custom Landing Pages**: Beautiful, customizable landing pages for each event
- **Registration Management**: View, manage, and export registrants from a central dashboard
- **Organization Admin Panel**: Secure management of organization settings and Zoom API credentials
- **Real-time Sync**: Instant synchronization of registrants to Zoom's registration database
- **Analytics & Reporting**: System-wide statistics and organization-level metrics

## 🚀 Quick Start with Docker (Recommended)

The fastest way to run the application locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/zoom-registration-app.git
cd zoom-registration-app

# Start everything with one command
docker compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

That's it! MongoDB, Backend, and Frontend are now running.

📖 **Detailed Docker Guide**: See [DOCKER.md](DOCKER.md) for complete Docker documentation
🚀 **Production Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md) for Digital Ocean deployment

---

## Technology Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Zoom Server-to-Server OAuth API
- RESTful API Architecture

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- CSS3 with modern styling

### DevOps
- Docker & Docker Compose
- Nginx (production)
- Multi-stage builds
- Health checks

## Project Structure

```
zoom-registration-app/
├── backend/
│   ├── models/              # MongoDB models
│   │   ├── Organization.js  # Organization schema
│   │   ├── Meeting.js       # Meeting/Webinar schema
│   │   ├── Registrant.js    # Registrant schema
│   │   └── Owner.js         # Owner/Admin schema
│   ├── routes/              # API routes
│   │   ├── organizations.js # Organization endpoints
│   │   ├── meetings.js      # Meeting endpoints
│   │   ├── registrants.js   # Registrant endpoints
│   │   ├── owners.js        # Owner authentication
│   │   └── admin.js         # Admin/Owner endpoints
│   ├── services/            # Business logic
│   │   └── zoomService.js   # Zoom API integration
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── ownerAuth.js     # Owner authentication
│   └── server.js            # Express server setup
├── client/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.js    # Organization navbar
│   │   │   └── OwnerNavbar.js # Owner portal navbar
│   │   ├── pages/           # Page components
│   │   │   ├── Home.js      # Landing page
│   │   │   ├── Register.js  # Organization signup
│   │   │   ├── Login.js     # Organization login
│   │   │   ├── Dashboard.js # Admin dashboard
│   │   │   ├── Meetings.js  # Meeting list
│   │   │   ├── CreateMeeting.js
│   │   │   ├── MeetingDetails.js
│   │   │   ├── Settings.js  # Zoom API settings
│   │   │   ├── LandingPage.js # Public event page
│   │   │   ├── RegistrationForm.js # Public registration
│   │   │   ├── OwnerLogin.js # Owner login
│   │   │   ├── OwnerDashboard.js # Owner dashboard
│   │   │   ├── OwnerOrganizations.js # Manage all orgs
│   │   │   ├── OwnerOrganizationDetails.js # Org details
│   │   │   ├── OwnerAllMeetings.js # All meetings
│   │   │   └── OwnerAllRegistrants.js # All registrants
│   │   ├── utils/           # Utility functions
│   │   │   ├── api.js       # API client
│   │   │   ├── auth.js      # Auth helpers
│   │   │   └── ownerAuth.js # Owner auth helpers
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   └── public/
└── README.md
```

## Installation

### Prerequisites

**Option 1: Docker (Recommended)**
- Docker and Docker Compose installed
- No other dependencies needed!

**Option 2: Manual Installation**
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) or MongoDB Atlas account
- Zoom Account with Server-to-Server OAuth app

---

### Option 1: Docker Installation (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/zoom-registration-app.git
cd zoom-registration-app

# 2. Start all services
docker compose up -d

# 3. View logs
docker compose logs -f

# 4. Stop services
docker compose down
```

**Done!** Access the app at http://localhost:3000

See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

---

### Option 2: Manual Installation

### Backend Setup

1. **Navigate to backend directory and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**

   **Quick Setup (Recommended):**
   ```bash
   ./setup.sh
   ```

   **Manual Setup:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/zoom-registration-app
   JWT_SECRET=your_secure_jwt_secret_here
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB:**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongodb

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the backend server:**
   ```bash
   npm start
   # Or for development with auto-reload
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

### Run Both Backend and Frontend

From the root directory:
```bash
# First, install root dependencies (includes concurrently)
npm install

# Then run both services
npm run dev:all
```

**Note:** This requires dependencies to be installed in all three locations:
- Root directory: `npm install`
- Backend: `cd backend && npm install`
- Frontend: `cd client && npm install`

## Zoom API Configuration

### Setting Up Zoom Server-to-Server OAuth

1. **Go to Zoom Marketplace:**
   - Visit https://marketplace.zoom.us/
   - Sign in with your Zoom account

2. **Create Server-to-Server OAuth App:**
   - Click "Develop" → "Build App"
   - Select "Server-to-Server OAuth"
   - Fill in app details

3. **Configure Scopes:**
   Add the following scopes:
   - `meeting:write:admin` - Create meetings
   - `meeting:read:admin` - Read meeting details
   - `meeting:write:meeting_registrant:admin` - Add meeting registrants
   - `webinar:write:admin` - Create webinars
   - `webinar:read:admin` - Read webinar details
   - `webinar:write:webinar_registrant:admin` - Add webinar registrants

4. **Get Credentials:**
   - Copy your Account ID
   - Copy your Client ID
   - Copy your Client Secret

5. **Add to Application:**
   - Log into your organization account
   - Navigate to Settings
   - Enter your Zoom credentials
   - Click "Update Credentials"

## Usage Guide

### For Website Owners (Super Admin)

The website owner dashboard provides comprehensive management capabilities for all organizations and tenants.

1. **Create Owner Account:**
   ```bash
   # Use the API to create the first owner account
   curl -X POST http://localhost:5000/api/owners/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin Name",
       "email": "admin@example.com",
       "password": "secure_password",
       "role": "owner",
       "secretKey": "your_owner_registration_secret_here"
     }'
   ```

2. **Access Owner Dashboard:**
   - Visit `/owner/login`
   - Login with owner credentials
   - Access the comprehensive admin portal

3. **Manage Organizations:**
   - View all registered organizations
   - Monitor organization statistics (meetings, registrants, sync rates)
   - Activate/deactivate organization accounts
   - View detailed organization information
   - Delete organizations (with all related data)

4. **System Overview:**
   - View system-wide statistics
   - Monitor registration trends
   - Track Zoom sync success rates
   - Identify top-performing organizations

5. **Data Management:**
   - View all meetings across all organizations
   - Access all registrant data
   - Filter and search across tenants
   - Export data for reporting

**Owner Portal Routes:**
- `/owner/login` - Owner authentication
- `/owner/dashboard` - Main dashboard with statistics
- `/owner/organizations` - Manage all organizations
- `/owner/organizations/:id` - Organization details
- `/owner/meetings` - View all meetings
- `/owner/registrants` - View all registrants

### For Organization Owners

1. **Create Account:**
   - Visit the homepage
   - Click "Get Started Free"
   - Fill in organization details
   - Your unique subdomain will be auto-generated

2. **Configure Zoom Integration:**
   - Go to Settings
   - Add your Zoom API credentials
   - These enable automatic registration sync

3. **Create a Meeting/Webinar:**
   - Click "Create New Meeting"
   - Fill in meeting details
   - Choose whether to create in Zoom automatically
   - Customize landing page content

4. **Share Registration Link:**
   - Copy the registration link from meeting details
   - Format: `yourdomain.com/your-subdomain/meeting-id`
   - Share with your audience

5. **Manage Registrants:**
   - View all registrants in meeting details
   - Export to CSV
   - Manually sync to Zoom if needed
   - Delete registrants as needed

### For Event Attendees

1. **Visit Registration Link:**
   - Click the link shared by the organizer
   - View event details on the landing page

2. **Register for Event:**
   - Click "Register Now"
   - Fill in registration form
   - Submit registration

3. **Confirmation:**
   - Receive instant confirmation
   - Get Zoom join link (if synced)
   - Check email for details

## API Endpoints

### Owner/Admin Endpoints

- `POST /api/owners/register` - Register new owner (requires secret key)
- `POST /api/owners/login` - Owner login
- `GET /api/owners/profile` - Get owner profile (authenticated)
- `PUT /api/owners/profile` - Update owner profile (authenticated)
- `PUT /api/owners/password` - Change owner password (authenticated)

### Admin Management Endpoints

- `GET /api/admin/stats` - Get system-wide statistics (owner only)
- `GET /api/admin/organizations` - Get all organizations with stats (owner only)
- `GET /api/admin/organizations/:id` - Get organization details (owner only)
- `PUT /api/admin/organizations/:id` - Update organization (owner only)
- `DELETE /api/admin/organizations/:id` - Delete organization (owner only)
- `GET /api/admin/meetings` - Get all meetings across organizations (owner only)
- `GET /api/admin/registrants` - Get all registrants across organizations (owner only)

### Organizations

- `POST /api/organizations/register` - Register new organization
- `POST /api/organizations/login` - Login
- `GET /api/organizations/profile` - Get profile (authenticated)
- `PUT /api/organizations/zoom-credentials` - Update Zoom credentials (authenticated)
- `GET /api/organizations/subdomain/:subdomain` - Get organization by subdomain (public)

### Meetings

- `POST /api/meetings` - Create meeting (authenticated)
- `GET /api/meetings` - Get all meetings (authenticated)
- `GET /api/meetings/:id` - Get meeting details (authenticated)
- `GET /api/meetings/public/:subdomain/:meetingId` - Get public meeting info
- `PUT /api/meetings/:id` - Update meeting (authenticated)
- `DELETE /api/meetings/:id` - Delete meeting (authenticated)

### Registrants

- `POST /api/registrants/register` - Register for meeting (public)
- `GET /api/registrants` - Get all registrants (authenticated)
- `GET /api/registrants/meeting/:meetingId` - Get meeting registrants (authenticated)
- `POST /api/registrants/:id/sync` - Sync registrant to Zoom (authenticated)
- `DELETE /api/registrants/:id` - Delete registrant (authenticated)

## Database Models

### Organization
```javascript
{
  organizationName: String,
  email: String,
  password: String (hashed),
  subdomain: String (unique),
  zoomAccountId: String,
  zoomClientId: String,
  zoomClientSecret: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Meeting
```javascript
{
  organizationId: ObjectId,
  meetingName: String,
  meetingType: String (meeting/webinar),
  description: String,
  zoomMeetingId: String,
  startTime: Date,
  duration: Number,
  timezone: String,
  landingPageTitle: String,
  landingPageDescription: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Registrant
```javascript
{
  meetingId: ObjectId,
  organizationId: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  company: String,
  jobTitle: String,
  customFields: Map,
  zoomRegistrantId: String,
  zoomJoinUrl: String,
  registeredAt: Date,
  syncedToZoom: Boolean,
  syncError: String
}
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes with middleware
- Secure storage of Zoom API credentials
- Input validation and sanitization
- CORS configuration

## Development

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test
```

### Building for Production

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
cd client
npm run build
```

The build folder will contain optimized production files.

## Deployment

### 🚀 Quick Deploy to Digital Ocean

See the comprehensive **[DEPLOYMENT.md](DEPLOYMENT.md)** guide for:

- **Docker deployment** to Digital Ocean Droplet
- **App Platform** deployment
- **SSL/TLS** configuration with Let's Encrypt
- **Environment variables** setup
- **Monitoring** and maintenance
- **Backup** and restore procedures

### Docker Production Deployment

```bash
# 1. Set up production environment variables
cp .env.example .env
nano .env  # Edit with production values

# 2. Deploy with production compose file
docker compose -f docker-compose.prod.yml up -d --build

# 3. View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Manual Deployment

#### Backend Deployment

1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to hosting service (Heroku, AWS, DigitalOcean, etc.)
4. Ensure MongoDB connection string is set

#### Frontend Deployment

1. Build the React app: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, AWS S3, etc.)
3. Update `REACT_APP_API_URL` to point to backend

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_production_secret
CLIENT_URL=your_production_frontend_url
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_password
REACT_APP_API_URL=https://api.your-domain.com
```

**📖 Complete deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access if using cloud MongoDB

**Zoom API Errors:**
- Verify API credentials are correct
- Check that required scopes are enabled
- Ensure Server-to-Server OAuth app is activated

**Registration Not Syncing:**
- Confirm Zoom credentials are configured
- Check that meeting has a Zoom ID
- Review sync error in registrant details

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review API endpoint documentation

## Future Enhancements

- Email notifications for registrants
- Calendar integration (.ics files)
- Multiple language support
- Custom branding options
- Analytics and reporting dashboard
- Webhook support for real-time updates
- Mobile app
- Integration with other video platforms

---

Built with ❤️ for seamless Zoom event management