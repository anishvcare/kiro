# Deployment Guide

## Prerequisites

- Ubuntu 20.04+ Server
- Node.js 18+ (use nvm)
- MySQL 8.0+
- Nginx
- PM2
- Domain name with DNS pointed to server

## Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx -y
```

## Step 2: Database Setup

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE retailshop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'retailshop'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON retailshop_db.* TO 'retailshop'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Application Setup

```bash
# Clone repository
cd /var/www
git clone your-repo-url retailshop
cd retailshop

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your database credentials
nano .env

npm install --production
npm run migrate

# Frontend setup
cd ../frontend
cp .env.example .env
# Edit .env with your API URL
nano .env

npm install
npm run build
```

## Step 4: Configure Environment

Edit `backend/.env`:
```
PORT=5000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=retailshop
DB_PASSWORD=your_secure_password
DB_NAME=retailshop_db
JWT_SECRET=generate-a-long-random-string-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## Step 5: Start Backend with PM2

```bash
cd /var/www/retailshop/backend

pm2 start src/server.js --name "retailshop-api" --env production
pm2 save
pm2 startup
```

## Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/retailshop`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    root /var/www/retailshop/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2|woff|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/retailshop/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/retailshop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 7: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 8: Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Maintenance Commands

```bash
# View logs
pm2 logs retailshop-api

# Restart application
pm2 restart retailshop-api

# Update application
cd /var/www/retailshop
git pull
cd backend && npm install --production && pm2 restart retailshop-api
cd ../frontend && npm install && npm run build
```

## First Login

After deployment, access the admin panel at `https://yourdomain.com/admin/login`

Default credentials:
- Email: admin@store.com
- Password: admin123

**IMPORTANT: Change the password immediately after first login!**
