# FMGE Daily Trainer - Deployment Guide

## cPanel Hosting with Node.js Support

Since your hosting supports Node.js on cPanel, here's the deployment strategy:

### Architecture
```
cPanel Server
├── Frontend (Next.js) → Node.js Application via cPanel
├── Backend (Laravel)  → PHP Application via cPanel
├── PostgreSQL         → cPanel PostgreSQL Database
└── Redis              → Redis addon or external service
```

---

## 1. Frontend Deployment (Next.js on cPanel Node.js)

### Step 1: Build locally
```bash
cd frontend
npm install
npm run build
```

### Step 2: Upload to cPanel
1. Upload the entire `frontend` folder to your cPanel home directory
2. In cPanel → **Setup Node.js App**
3. Configure:
   - **Node.js version**: 22.x
   - **Application mode**: Production
   - **Application root**: frontend
   - **Application URL**: your-domain.com
   - **Application startup file**: server.js (from .next/standalone)

### Step 3: Environment Variables
In the Node.js app settings, add:
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NODE_ENV=production
PORT=3000
```

### Step 4: Create startup script
Create `frontend/start.sh`:
```bash
#!/bin/bash
cd /home/username/frontend
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
cd .next/standalone
node server.js
```

---

## 2. Backend Deployment (Laravel on cPanel)

### Step 1: Create PostgreSQL Database
1. cPanel → **PostgreSQL Databases**
2. Create database: `fmge_trainer`
3. Create user: `fmge_user`
4. Assign user to database

### Step 2: Upload Laravel
1. Upload `backend` folder to cPanel (e.g., `/home/username/api.your-domain.com`)
2. Point subdomain `api.your-domain.com` to `/home/username/api.your-domain.com/public`

### Step 3: Configure .env
```bash
cp .env.example .env
```
Update with your database credentials and other settings.

### Step 4: Install dependencies & setup
Via cPanel Terminal or SSH:
```bash
cd /home/username/api.your-domain.com
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan db:seed
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

### Step 5: Setup Cron Job
In cPanel → **Cron Jobs**, add:
```
* * * * * cd /home/username/api.your-domain.com && php artisan schedule:run >> /dev/null 2>&1
```

---

## 3. Redis Setup

### Option A: Redis addon (if available)
Check if your cPanel hosting offers Redis addon.

### Option B: External Redis
Use a managed Redis service like:
- **Upstash** (Free tier available)
- **Redis Cloud** (Free 30MB)
- **Railway** (Hobby tier)

Update `.env`:
```
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### Option C: File-based caching (Fallback)
If Redis is not available, use file cache:
```
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database
```

---

## 4. Domain & SSL Setup

### DNS Configuration
```
A Record: your-domain.com → Server IP
A Record: api.your-domain.com → Server IP
CNAME: www.your-domain.com → your-domain.com
```

### SSL
- Use cPanel's **Let's Encrypt** auto-SSL
- Or Cloudflare Free SSL with Full (Strict) mode

---

## 5. Cloudflare CDN Setup (Recommended)

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable:
   - **SSL/TLS**: Full (Strict)
   - **Speed → Optimization**: Auto Minify (JS, CSS, HTML)
   - **Caching**: Standard
   - **Page Rules**:
     - `api.your-domain.com/*` → Cache Level: Bypass
     - `your-domain.com/static/*` → Cache Level: Cache Everything, Edge TTL: 1 month

---

## 6. Firebase Setup (Push Notifications)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: "FMGE Trainer"
3. Enable Cloud Messaging
4. Get config keys and update `.env` files
5. Download `firebase-credentials.json` for backend

---

## 7. Daily Challenge Automation

The scheduler handles daily test generation. Ensure cron is running:

```php
// app/Console/Kernel.php - already configured
$schedule->command('tests:generate-daily')->dailyAt('08:00');
$schedule->command('notifications:send-morning')->dailyAt('08:55');
$schedule->command('notifications:send-evening')->dailyAt('18:55');
$schedule->command('leaderboard:update')->hourly();
```

---

## 8. Quick Start Commands

```bash
# Full local development setup
docker-compose up -d

# Run migrations
docker-compose exec backend php artisan migrate --seed

# Build frontend
cd frontend && npm run build

# Run tests
cd backend && php artisan test
cd frontend && npm run test
```

---

## Default Login Credentials

### Admin
- Email: admin@fmgetrainer.com
- Password: admin123456

### Demo Student
- Email: student@fmgetrainer.com
- Password: student123456

---

## Performance Checklist

- [ ] Enable OPcache for PHP
- [ ] Enable Redis caching
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Enable Cloudflare CDN
- [ ] Set up proper cron job
- [ ] Configure queue workers
- [ ] Enable GZIP compression
- [ ] Set up database indexes (included in migrations)
- [ ] Configure proper session handling
