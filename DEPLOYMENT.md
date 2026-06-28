# Deployment Guide - Universal Local Shopping & Delivery Platform

## cPanel Deployment Instructions

This guide covers deploying the platform on a cPanel hosting environment with Apache, Node.js, and MySQL.

---

## Prerequisites

- cPanel hosting with Node.js support (CloudLinux or similar)
- MySQL 8.0+ database
- SSH access (recommended) or File Manager access
- Domain name pointed to hosting server
- Node.js 18+ available in cPanel

---

## Step 1: Database Setup

### Create MySQL Database

1. Log in to cPanel
2. Navigate to **MySQL Databases**
3. Create a new database (e.g., `localshop_db`)
4. Create a database user with a strong password
5. Add the user to the database with **ALL PRIVILEGES**

### Import Schema

1. Go to **phpMyAdmin** in cPanel
2. Select the newly created database
3. Click **Import**
4. Upload `database/schema.sql`
5. Click **Go** to execute

### Import Seed Data (Optional)

For testing, also import `database/seed.sql` which contains sample data.

---

## Step 2: Backend Setup

### Upload Files

1. Upload the `backend/` directory contents to your hosting (e.g., `/home/user/localshop-api/`)
2. Ensure `node_modules` is NOT uploaded (will be installed via SSH)

### Configure Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=localshop_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Email (Nodemailer)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-key
FIREBASE_CLIENT_EMAIL=your-firebase-email

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Install Dependencies

Via SSH:
```bash
cd /home/user/localshop-api
npm install --production
```

### Set Up Node.js Application in cPanel

1. Go to **Setup Node.js App** in cPanel
2. Click **Create Application**
3. Configure:
   - Node.js version: 18+ (or latest available)
   - Application mode: Production
   - Application root: `/home/user/localshop-api`
   - Application URL: `api.yourdomain.com` (or subdomain)
   - Application startup file: `server.js`
4. Click **Create**
5. Click **Run NPM Install**

### Verify Backend

Visit `https://api.yourdomain.com/api/health` to check the API is running.

---

## Step 3: Frontend Setup

### Build Frontend

On your local machine:
```bash
cd frontend
cp .env.example .env.production
```

Edit `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
```

Build the production bundle:
```bash
npm install
npm run build
```

### Upload Frontend

1. Upload the contents of `frontend/dist/` to `public_html/` (or your domain document root)
2. Ensure `index.html` is in the root of `public_html`

### Configure .htaccess

Place the `.htaccess` file in `public_html/` for SPA routing:

```apache
RewriteEngine On
RewriteBase /

# Handle API proxy (if same domain)
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# Handle SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Step 4: Apache Reverse Proxy for API

If API runs on a subdomain, create an `.htaccess` in the API subdomain root:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
```

See `backend/.htaccess` for the complete configuration.

---

## Step 5: File Permissions

Set correct permissions via SSH:
```bash
# Backend
chmod 755 /home/user/localshop-api
chmod 644 /home/user/localshop-api/.env
chmod -R 755 /home/user/localshop-api/uploads

# Frontend
chmod -R 755 /home/user/public_html
```

---

## Step 6: SSL Certificate

1. Go to **SSL/TLS** in cPanel
2. Use **AutoSSL** or install Let's Encrypt
3. Ensure both the main domain and API subdomain have SSL

---

## Step 7: Cron Jobs (Optional)

Set up cron jobs in cPanel for maintenance tasks:

```bash
# Clear expired tokens daily at midnight
0 0 * * * cd /home/user/localshop-api && node -e "require('./cron/cleanup')"

# Database backup weekly
0 2 * * 0 mysqldump -u user -p'password' localshop_db > /home/user/backups/db_$(date +\%Y\%m\%d).sql
```

---

## Automated Deployment

Use the provided `cPanel-deploy.sh` script for automated deployments:

```bash
chmod +x cPanel-deploy.sh
./cPanel-deploy.sh
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check if Node.js app is running in cPanel |
| CORS errors | Verify CORS_ORIGIN in backend .env |
| Database connection refused | Check DB_HOST, ensure user has privileges |
| File upload fails | Check upload directory permissions (755) |
| Socket.IO not connecting | Ensure WebSocket upgrade is allowed in Apache |

### Checking Logs

```bash
# Application logs
tail -f /home/user/localshop-api/logs/error.log

# Apache error log (via cPanel)
# Go to Metrics > Errors
```

### Restarting the Application

Via cPanel:
1. Go to **Setup Node.js App**
2. Click **Restart** on your application

Via SSH:
```bash
cd /home/user/localshop-api
touch tmp/restart.txt
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | Set to `production` |
| PORT | Yes | API port (default: 5000) |
| DB_HOST | Yes | MySQL host |
| DB_NAME | Yes | Database name |
| DB_USER | Yes | Database user |
| DB_PASSWORD | Yes | Database password |
| JWT_SECRET | Yes | JWT signing secret |
| CORS_ORIGIN | Yes | Frontend URL |
| SMTP_HOST | No | Email server host |
| FIREBASE_PROJECT_ID | No | Push notification config |
