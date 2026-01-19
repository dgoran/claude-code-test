# Docker Quick Start Guide

Run the entire Zoom Registration Platform with a single command using Docker!

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)
- Git installed

## Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zoom-registration-app.git
cd zoom-registration-app
```

### 2. Configure Environment (Optional)

```bash
# Copy example environment file
cp .env.example .env

# Edit if needed (default values work for local development)
nano .env
```

### 3. Start the Application

```bash
# Build and start all services (MongoDB, Backend, Frontend)
docker compose up -d

# View logs
docker compose logs -f
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 5. Stop the Application

```bash
# Stop all services
docker compose down

# Stop and remove volumes (deletes all data!)
docker compose down -v
```

---

## What Gets Installed?

When you run `docker compose up`, Docker will:

1. **Pull MongoDB 7.0 image** (~400MB)
2. **Build Backend container** (Node.js app)
3. **Build Frontend container** (React app with Nginx)
4. **Create network** for services to communicate
5. **Create volumes** for MongoDB data persistence

---

## Docker Commands Cheat Sheet

### Start Services

```bash
# Start all services in background
docker compose up -d

# Start and rebuild
docker compose up -d --build

# Start specific service
docker compose up backend
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Stop specific service
docker compose stop backend
```

### View Logs

```bash
# View all logs
docker compose logs

# Follow logs (real-time)
docker compose logs -f

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb
```

### Manage Containers

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Enter container shell
docker exec -it zoom-registration-backend sh
docker exec -it zoom-registration-frontend sh

# Enter MongoDB shell
docker exec -it zoom-registration-mongodb mongosh
```

### Resource Management

```bash
# View resource usage
docker stats

# Remove unused images
docker image prune

# Remove all unused resources
docker system prune -a
```

### Debugging

```bash
# Inspect container
docker inspect zoom-registration-backend

# Check container health
docker inspect zoom-registration-backend | grep -A 10 Health

# View container processes
docker top zoom-registration-backend
```

---

## Development Workflow

### Making Code Changes

The development setup includes **hot-reload**:

#### Backend Changes:
1. Edit files in `backend/` directory
2. Changes auto-reload (using nodemon)
3. No need to rebuild container

#### Frontend Changes:
1. Edit files in `client/src/` directory
2. Container needs rebuild for changes
3. Rebuild: `docker compose up -d --build frontend`

### Database Management

#### View Database Data:

```bash
# Enter MongoDB shell
docker exec -it zoom-registration-mongodb mongosh

# Use database
use zoom-registration-app

# Show collections
show collections

# Query organizations
db.organizations.find()

# Query meetings
db.meetings.find()

# Query registrants
db.registrants.find()

# Exit
exit
```

#### Backup Database:

```bash
# Create backup
docker exec zoom-registration-mongodb mongodump --out /data/backup

# Copy to host
docker cp zoom-registration-mongodb:/data/backup ./backup
```

#### Restore Database:

```bash
# Copy backup to container
docker cp ./backup zoom-registration-mongodb:/data/restore

# Restore
docker exec zoom-registration-mongodb mongorestore /data/restore
```

---

## Production Deployment

For production, use the production compose file:

```bash
# Set environment variables first!
cp .env.example .env
nano .env  # Set production values

# Deploy
docker compose -f docker-compose.prod.yml up -d --build
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full production deployment guide.

---

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Option 1: Stop the service using the port
lsof -ti:3000 | xargs kill -9

# Option 2: Change port in docker-compose.yml
# Change "3000:80" to "3001:80"
```

### Container Won't Start

```bash
# Check logs for errors
docker compose logs backend

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker compose logs mongodb

# Restart MongoDB
docker compose restart mongodb
```

### Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove specific volumes
docker volume ls
docker volume rm volume_name
```

### Changes Not Showing

```bash
# Rebuild containers
docker compose up -d --build

# Clear cache and rebuild
docker compose build --no-cache
docker compose up -d
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
└─────────────────────────────────────────┘
              │
    ┌─────────┴─────────┬─────────────┐
    │                   │             │
┌───▼────┐         ┌────▼───┐    ┌───▼────┐
│Frontend│         │Backend │    │MongoDB │
│(React) │◄────────│(Node.js)◄───│ 7.0    │
│Nginx   │         │Express │    │        │
│Port 80 │         │Port 5000    │Port    │
│        │         │        │    │27017   │
└────────┘         └────────┘    └────────┘
    │                   │             │
    └───────────────────┴─────────────┘
              zoom-network
```

### Services

1. **Frontend (React + Nginx)**
   - Serves static React build
   - Handles client routing
   - Port: 3000 (mapped to 80 in container)

2. **Backend (Node.js + Express)**
   - REST API server
   - Handles authentication
   - Connects to MongoDB
   - Port: 5000

3. **MongoDB**
   - Database server
   - Persistent data storage
   - Port: 27017

### Volumes

- `mongodb_data`: Stores MongoDB database files
- `mongodb_config`: Stores MongoDB configuration

### Network

- `zoom-network`: Bridge network connecting all services

---

## Environment Variables

### Development (.env)

```env
JWT_SECRET=development_secret_change_in_production
MONGODB_URI=mongodb://mongodb:27017/zoom-registration-app
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Production (.env)

```env
JWT_SECRET=<secure-random-string-32-chars>
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=<secure-password>
MONGODB_URI=mongodb://admin:password@mongodb:27017/zoom-registration-app?authSource=admin
CLIENT_URL=https://your-domain.com
REACT_APP_API_URL=https://api.your-domain.com
NODE_ENV=production
```

---

## Performance Optimization

### 1. Multi-stage Builds

Frontend uses multi-stage build:
- Build stage: Compiles React app
- Production stage: Serves with lightweight Nginx

### 2. Caching

Docker caches layers for faster rebuilds:
```bash
# Force rebuild without cache
docker compose build --no-cache
```

### 3. Resource Limits

Optionally limit resources in docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

---

## Security Best Practices

1. ✅ **Never commit .env files** (already in .gitignore)
2. ✅ **Use secrets in production** (Docker secrets or environment variables)
3. ✅ **Run as non-root user** (already configured in Dockerfiles)
4. ✅ **Scan images for vulnerabilities**
   ```bash
   docker scan zoom-registration-backend
   ```
5. ✅ **Keep images updated**
   ```bash
   docker compose pull
   docker compose up -d
   ```

---

## Next Steps

- ✅ Configure Zoom API credentials in Settings
- ✅ Create your first meeting
- ✅ Test registration flow
- ✅ Deploy to production (see DEPLOYMENT.md)

---

## Support

For issues:
- Check logs: `docker compose logs -f`
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Create issue on GitHub

---

**Happy Dockerizing!** 🐳
