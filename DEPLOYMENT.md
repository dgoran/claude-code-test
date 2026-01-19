# Deployment Guide - Digital Ocean

This guide will walk you through deploying the Zoom Registration Platform to Digital Ocean using Docker.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Option 1: Deploy to Digital Ocean Droplet](#option-1-deploy-to-digital-ocean-droplet)
- [Option 2: Deploy to Digital Ocean App Platform](#option-2-deploy-to-digital-ocean-app-platform)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Environment Variables](#environment-variables)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

- Digital Ocean account (sign up at https://www.digitalocean.com)
- Domain name (optional but recommended)
- Git installed locally
- Basic knowledge of command line

---

## Option 1: Deploy to Digital Ocean Droplet

### Step 1: Create a Droplet

1. Log in to Digital Ocean
2. Click "Create" → "Droplets"
3. Choose configuration:
   - **Image**: Ubuntu 24.04 LTS x64
   - **Plan**: Basic ($12/month - 2GB RAM, 1 vCPU recommended minimum)
   - **Datacenter region**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) or Password
   - **Hostname**: zoom-registration-app
4. Click "Create Droplet"
5. Wait for droplet to be created (1-2 minutes)

### Step 2: Connect to Your Droplet

```bash
# SSH into your droplet (replace IP with your droplet's IP)
ssh root@your_droplet_ip
```

### Step 3: Install Docker and Docker Compose

```bash
# Update package index
apt update && apt upgrade -y

# Install required packages
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Start Docker
systemctl start docker
systemctl enable docker
```

### Step 4: Install Git and Clone Repository

```bash
# Install Git
apt install -y git

# Clone your repository
git clone https://github.com/yourusername/zoom-registration-app.git
cd zoom-registration-app
```

### Step 5: Configure Environment Variables

```bash
# Create production .env file
cp .env.example .env

# Edit the .env file
nano .env
```

**Important variables to set:**
```env
# MUST CHANGE THESE IN PRODUCTION!
JWT_SECRET=your_super_secure_random_string_here_minimum_32_characters
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=very_secure_password_change_this

# Your domain or droplet IP
CLIENT_URL=http://your-domain.com
REACT_APP_API_URL=http://your-domain.com:5000

NODE_ENV=production
```

**Generate a secure JWT secret:**
```bash
# Option 1: Use OpenSSL
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 6: Deploy with Docker Compose

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Check if containers are running
docker ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Step 7: Configure Firewall

```bash
# Install and configure UFW firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5000/tcp
ufw enable

# Check status
ufw status
```

### Step 8: Point Your Domain (Optional)

1. Go to your domain registrar
2. Add an A record pointing to your droplet's IP address:
   - **Type**: A
   - **Name**: @ (or subdomain like "app")
   - **Value**: your_droplet_ip
   - **TTL**: 3600

Wait 5-15 minutes for DNS propagation.

### Step 9: Test Your Application

```bash
# Check backend health
curl http://your_droplet_ip:5000/api/health

# Check frontend
curl http://your_droplet_ip
```

Open in browser: `http://your_droplet_ip` or `http://your-domain.com`

---

## Option 2: Deploy to Digital Ocean App Platform

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub, GitLab, or Bitbucket.

### Step 2: Create App in App Platform

1. Log in to Digital Ocean
2. Click "Create" → "Apps"
3. Choose your Git provider and repository
4. Select branch (e.g., `main` or `master`)
5. Click "Next"

### Step 3: Configure App Components

#### Backend Configuration:
- **Name**: backend
- **Type**: Web Service
- **Dockerfile Path**: /backend/Dockerfile
- **HTTP Port**: 5000
- **Environment Variables**: Add all from .env.example

#### Frontend Configuration:
- **Name**: frontend
- **Type**: Static Site
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: client/build

#### Database:
- Add a "Database" component
- Choose "MongoDB" (or use MongoDB Atlas)

### Step 4: Configure Environment Variables

Add all environment variables from `.env.example`:
- JWT_SECRET
- MONGODB_URI (provided by App Platform if using their MongoDB)
- CLIENT_URL
- REACT_APP_API_URL

### Step 5: Deploy

1. Review configuration
2. Click "Create Resources"
3. Wait for deployment (5-10 minutes)
4. App Platform will provide you with URLs

---

## SSL/TLS Configuration

### Option A: Using Nginx and Let's Encrypt (Droplet)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Install Nginx
apt install -y nginx

# Configure Nginx as reverse proxy
nano /etc/nginx/sites-available/zoom-registration
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/zoom-registration /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Option B: Digital Ocean App Platform

SSL is automatically configured by App Platform for custom domains.

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://user:pass@mongodb:27017/db` |
| `JWT_SECRET` | JWT signing secret | `random_32_char_string` |
| `CLIENT_URL` | Frontend URL | `https://your-domain.com` |
| `REACT_APP_API_URL` | Backend API URL | `https://api.your-domain.com` |

### MongoDB Variables (for Docker)

| Variable | Description |
|----------|-------------|
| `MONGO_ROOT_USERNAME` | MongoDB admin username |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password |

---

## Monitoring and Maintenance

### Check Container Status

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs mongodb

# Follow logs in real-time
docker compose -f docker-compose.prod.yml logs -f
```

### Restart Services

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Clean up old images
docker image prune -f
```

### Backup MongoDB Data

```bash
# Create backup
docker exec zoom-registration-mongodb mongodump --out /data/backup

# Copy backup to host
docker cp zoom-registration-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)

# Compress backup
tar -czf mongodb-backup-$(date +%Y%m%d).tar.gz ./mongodb-backup-$(date +%Y%m%d)
```

### Restore MongoDB Data

```bash
# Copy backup to container
docker cp ./mongodb-backup-20240119 zoom-registration-mongodb:/data/restore

# Restore
docker exec zoom-registration-mongodb mongorestore /data/restore
```

### Monitor Resources

```bash
# View resource usage
docker stats

# View disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker compose -f docker-compose.prod.yml logs backend

# Check container health
docker inspect zoom-registration-backend | grep -A 10 Health
```

### MongoDB Connection Issues

```bash
# Verify MongoDB is running
docker ps | grep mongodb

# Test MongoDB connection
docker exec -it zoom-registration-mongodb mongosh
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Or
netstat -tulpn | grep 5000

# Kill process
kill -9 <PID>
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

---

## Security Best Practices

1. **Change default passwords**: Always use strong, unique passwords
2. **Use SSH keys**: Disable password authentication
3. **Enable firewall**: Configure UFW to allow only necessary ports
4. **Regular updates**: Keep system and Docker images updated
5. **SSL/TLS**: Always use HTTPS in production
6. **Backup regularly**: Set up automated backups
7. **Monitor logs**: Check logs regularly for suspicious activity
8. **Use secrets management**: Don't commit secrets to Git
9. **Limit MongoDB access**: Don't expose MongoDB port to public
10. **Use MongoDB Atlas**: Consider managed MongoDB for production

---

## Cost Estimation

### Digital Ocean Droplet
- **Basic Droplet**: $12/month (2GB RAM, 1 vCPU)
- **Better Performance**: $24/month (4GB RAM, 2 vCPU)
- **Backups**: +20% of droplet cost
- **Domain**: ~$10-15/year

### Digital Ocean App Platform
- **Basic Plan**: $12/month (web service)
- **Managed MongoDB**: $15/month (1GB storage)
- **Total**: ~$27/month

### Recommended for Production
- Use **MongoDB Atlas** (free tier or $9/month)
- Use **Digital Ocean Droplet** ($12-24/month)
- Use **Cloudflare** for free SSL and CDN
- **Total**: $12-24/month

---

## Next Steps

After deployment:
1. ✅ Test all functionality
2. ✅ Configure Zoom API credentials in Settings
3. ✅ Create your first meeting
4. ✅ Test registration flow
5. ✅ Set up monitoring (optional)
6. ✅ Configure automated backups
7. ✅ Set up domain and SSL

---

## Support

For issues:
- Check logs: `docker compose -f docker-compose.prod.yml logs`
- Review documentation
- Create GitHub issue
- Check Digital Ocean community tutorials

---

**Congratulations!** Your Zoom Registration Platform is now deployed and ready for production use! 🎉
