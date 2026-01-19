# Quick Start Guide - MongoDB Atlas Setup

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account (FREE - no credit card needed)

## Step 2: Create a Free Cluster

1. Click "Build a Database"
2. Select **FREE** tier (M0 Sandbox - 512MB)
3. Choose cloud provider: AWS, Google Cloud, or Azure
4. Select region closest to you
5. Cluster Name: Leave default or name it "ZoomRegistration"
6. Click "Create"

**Wait 1-3 minutes for cluster to deploy**

## Step 3: Create Database User

1. On the "Security Quickstart" page, create a database user:
   - Username: `zoom_admin` (or any name you like)
   - Password: Click "Autogenerate Secure Password" or create your own
   - **SAVE THIS PASSWORD!** You'll need it for the connection string
2. Click "Create User"

## Step 4: Set Network Access

1. Still on "Security Quickstart" page:
   - Click "Add My Current IP Address"
   - OR for development, add `0.0.0.0/0` (allows from anywhere)
2. Click "Finish and Close"

## Step 5: Get Connection String

1. Click "Connect" button on your cluster
2. Choose "Drivers"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://zoom_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password from Step 3
6. Add your database name after `.net/`:
   ```
   mongodb+srv://zoom_admin:yourpassword@cluster0.xxxxx.mongodb.net/zoom-registration-app?retryWrites=true&w=majority
   ```

## Step 6: Update Your Application

1. Open your `.env` file in the project root
2. Update the MONGODB_URI:
   ```env
   MONGODB_URI=mongodb+srv://zoom_admin:yourpassword@cluster0.xxxxx.mongodb.net/zoom-registration-app?retryWrites=true&w=majority
   ```

## Step 7: Start Your Application

```bash
# Terminal 1: Start Backend
cd /path/to/zoom-registration-app
npm install
npm start

# Terminal 2: Start Frontend
cd /path/to/zoom-registration-app/client
npm install
npm start
```

Your app will be running at **http://localhost:3000**

## Troubleshooting

**Connection Error?**
- Check your password has no special characters that need URL encoding
- Verify network access is set to `0.0.0.0/0` in Atlas
- Make sure you added `/zoom-registration-app` after `.net/`

**Need to URL encode password with special chars:**
```
! = %21
@ = %40
# = %23
$ = %24
% = %25
^ = %5E
& = %26
* = %2A
```

## Free Tier Limits

MongoDB Atlas Free (M0) tier includes:
- 512 MB storage
- Shared RAM
- Shared vCPU
- Perfect for development and testing!

---

**Ready to go!** Your database is now in the cloud and accessible from anywhere.
