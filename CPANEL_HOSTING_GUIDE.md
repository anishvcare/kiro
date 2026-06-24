# FMGE Daily Trainer - cPanel Hosting Guide (Step by Step)

## 📋 What You Need

| Requirement | Details |
|-------------|---------|
| cPanel Hosting | With Node.js support (e.g., A2 Hosting, Namecheap, Hostinger VPS) |
| Domain | e.g., `fmgetrainer.com` |
| Subdomain for API | e.g., `api.fmgetrainer.com` |
| PHP Version | 8.1 or higher |
| Node.js Version | 18 or higher |
| Database | PostgreSQL (preferred) or MySQL |
| SSH Access | Required for initial setup |

---

## PART 1: BACKEND (Laravel API) Setup

### Step 1: Create Subdomain for API

1. Login to **cPanel**
2. Go to **Domains** → **Subdomains** (or **Domains** section in newer cPanel)
3. Create subdomain: `api.fmgetrainer.com`
4. Document Root: `/home/yourusername/api.fmgetrainer.com`
5. Click **Create**

### Step 2: Create Database

#### If PostgreSQL is available:
1. Go to **PostgreSQL Databases**
2. Create database: `fmge_trainer`
3. Create user: `fmge_user` with strong password
4. Add user to database with **ALL PRIVILEGES**

#### If only MySQL is available:
1. Go to **MySQL Databases**
2. Create database: `yourusername_fmge`
3. Create user: `yourusername_fmge` with strong password
4. Add user to database with **ALL PRIVILEGES**

> **Note your credentials:**
> - Database name: `yourusername_fmge`
> - Username: `yourusername_fmge`
> - Password: `your_password`
> - Host: `localhost`

### Step 3: Upload Laravel Backend

**Option A: Using Git (Recommended)**

1. Open **cPanel Terminal** (or SSH)
2. Run these commands:

```bash
cd /home/yourusername/
git clone https://github.com/anishvcare/kiro.git temp_repo
mv temp_repo/backend/* api.fmgetrainer.com/
mv temp_repo/backend/.* api.fmgetrainer.com/ 2>/dev/null
rm -rf temp_repo
```

**Option B: Using File Manager**

1. On your LOCAL machine, zip the `backend` folder
2. Go to cPanel → **File Manager**
3. Navigate to `/home/yourusername/api.fmgetrainer.com/`
4. Upload the zip file
5. Extract it
6. Make sure all files are in the root (not inside a subfolder)

### Step 4: Point Domain to Laravel Public Folder

**IMPORTANT:** Laravel serves from the `public/` folder.

1. Go to cPanel → **Domains** (or **Subdomains**)
2. Edit `api.fmgetrainer.com`
3. Change **Document Root** to: `/home/yourusername/api.fmgetrainer.com/public`

**Alternative: Using .htaccess (if you can't change document root)**

Create `/home/yourusername/api.fmgetrainer.com/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

### Step 5: Configure Laravel Environment

1. Open **cPanel Terminal**
2. Run:

```bash
cd /home/yourusername/api.fmgetrainer.com

# Copy environment file
cp .env.example .env

# Edit the .env file
nano .env
```

3. Update these values in `.env`:

```env
APP_NAME="FMGE Daily Trainer"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.fmgetrainer.com

# FOR MYSQL (if not PostgreSQL):
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=yourusername_fmge
DB_USERNAME=yourusername_fmge
DB_PASSWORD=your_database_password

# FOR POSTGRESQL:
# DB_CONNECTION=pgsql
# DB_HOST=localhost
# DB_PORT=5432
# DB_DATABASE=fmge_trainer
# DB_USERNAME=fmge_user
# DB_PASSWORD=your_database_password

# Change cache to file (if no Redis)
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

# Your frontend domain (for CORS)
SANCTUM_STATEFUL_DOMAINS=fmgetrainer.com,www.fmgetrainer.com
FRONTEND_URL=https://fmgetrainer.com

# Mail (use your cPanel email or Gmail SMTP)
MAIL_MAILER=smtp
MAIL_HOST=mail.fmgetrainer.com
MAIL_PORT=465
MAIL_USERNAME=noreply@fmgetrainer.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@fmgetrainer.com
MAIL_FROM_NAME="FMGE Trainer"
```

Press `Ctrl + X`, then `Y`, then `Enter` to save.

### Step 6: Install Laravel Dependencies

In **cPanel Terminal**:

```bash
cd /home/yourusername/api.fmgetrainer.com

# Install Composer (if not available)
curl -sS https://getcomposer.org/installer | php
mv composer.phar /home/yourusername/bin/composer
export PATH=$PATH:/home/yourusername/bin

# Install dependencies
composer install --no-dev --optimize-autoloader

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate --force

# Seed the database (subjects, questions, plans)
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Cache configuration for speed
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 7: Set File Permissions

```bash
cd /home/yourusername/api.fmgetrainer.com

# Set proper permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chown -R yourusername:yourusername storage
chown -R yourusername:yourusername bootstrap/cache
```

### Step 8: Setup Cron Job (for Daily Tests)

1. Go to cPanel → **Cron Jobs**
2. Add new cron job:
   - **Common Settings:** Once Per Minute
   - **Command:**
```
cd /home/yourusername/api.fmgetrainer.com && /usr/local/bin/php artisan schedule:run >> /dev/null 2>&1
```

> ⚠️ Check your PHP path. Run `which php` in terminal to find it.
> It might be `/usr/bin/php` or `/usr/local/bin/php` or `/opt/cpanel/ea-php81/root/usr/bin/php`

### Step 9: Test Backend API

Open your browser and go to:
- `https://api.fmgetrainer.com/api/auth/login`

You should see a JSON response (even if it's an error about missing credentials - that means it's working!).

Try the health check:
- `https://api.fmgetrainer.com/up`

---

## PART 2: FRONTEND (Next.js) Setup

### Step 10: Build Frontend Locally

On your **LOCAL computer**:

```bash
cd frontend

# Install dependencies
npm install

# Create production .env
cp .env.example .env.production
```

Edit `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.fmgetrainer.com/api
NEXT_PUBLIC_APP_URL=https://fmgetrainer.com
```

Build:
```bash
npm run build
```

This creates the `.next` folder with the production build.

### Step 11: Setup Node.js App in cPanel

1. Go to cPanel → **Setup Node.js App**
2. Click **Create Application**
3. Configure:

| Setting | Value |
|---------|-------|
| Node.js Version | 18.x or 20.x or 22.x (latest available) |
| Application Mode | Production |
| Application Root | `fmgetrainer.com` (or your main domain folder) |
| Application URL | `fmgetrainer.com` |
| Application Startup File | `server.js` |

4. Click **Create**
5. **Note the virtual environment path** shown (e.g., `/home/yourusername/nodevenv/fmgetrainer.com/22/bin/activate`)

### Step 12: Upload Frontend Files

**What to upload to `/home/yourusername/fmgetrainer.com/`:**

You need to upload the **standalone** build. Here's what to do:

**On your LOCAL machine after building:**

```bash
cd frontend

# The standalone output is in .next/standalone
# Copy required files:
cp -r .next/standalone/* /path/to/upload/
cp -r .next/static /path/to/upload/.next/static
cp -r public /path/to/upload/public
```

**Upload these to cPanel:**

1. Zip the prepared files
2. Go to **File Manager** → `/home/yourusername/fmgetrainer.com/`
3. Upload and extract

**Your folder structure should look like:**
```
/home/yourusername/fmgetrainer.com/
├── .next/
│   ├── static/
│   └── ... (other build files)
├── node_modules/  (minimal, from standalone)
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── firebase-messaging-sw.js
├── server.js      ← This is the startup file
├── package.json
└── .env.production
```

### Step 13: Configure Environment in Node.js App

1. Go back to **Setup Node.js App** in cPanel
2. Click **Edit** on your application
3. In **Environment Variables** section, add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `HOSTNAME` | `0.0.0.0` |
| `NEXT_PUBLIC_API_URL` | `https://api.fmgetrainer.com/api` |

4. Click **Save**

### Step 14: Install Dependencies & Start

In the Node.js App panel:
1. Click **Run NPM Install** (or go to terminal)

Or via **Terminal**:
```bash
cd /home/yourusername/fmgetrainer.com
source /home/yourusername/nodevenv/fmgetrainer.com/22/bin/activate
npm install --production
```

Then click **Restart Application** in cPanel Node.js panel.

### Step 15: Alternative - Static Export (Simpler Method)

If Node.js app setup is complex, you can do a **static export**:

1. Edit `frontend/next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: "export",  // Changed from "standalone"
  // ... rest of config
};
```

2. Build: `npm run build`
3. Upload the `out/` folder contents to `/home/yourusername/public_html/`
4. No Node.js app needed!

> ⚠️ Static export won't support middleware or server-side features. But it works for most PWA use cases.

---

## PART 3: SSL & Domain Configuration

### Step 16: Enable SSL

1. Go to cPanel → **SSL/TLS** → **Manage SSL Sites**
2. Or use **AutoSSL** / **Let's Encrypt** (usually automatic)
3. Ensure SSL works for both:
   - `fmgetrainer.com`
   - `api.fmgetrainer.com`

### Step 17: Force HTTPS

Add to `/home/yourusername/fmgetrainer.com/.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

And to `/home/yourusername/api.fmgetrainer.com/public/.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## PART 4: CORS Configuration

### Step 18: Configure CORS for API

The Laravel CORS is already configured. But make sure in your `.env`:

```env
SANCTUM_STATEFUL_DOMAINS=fmgetrainer.com,www.fmgetrainer.com
```

If you still face CORS issues, add to `api.fmgetrainer.com/public/.htaccess`:
```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://fmgetrainer.com"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

---

## PART 5: Testing

### Step 19: Test Everything

1. **Visit your frontend:** `https://fmgetrainer.com`
   - You should see the landing page
   
2. **Test API:** `https://api.fmgetrainer.com/up`
   - Should return success

3. **Test Login:**
   - Email: `admin@fmgetrainer.com`
   - Password: `admin123456`

4. **Test Student:**
   - Email: `student@fmgetrainer.com`
   - Password: `student123456`

5. **Check PWA:**
   - Open on mobile Chrome
   - You should see "Install App" prompt
   - Check Lighthouse score

---

## PART 6: Troubleshooting

### Common Issues:

#### "500 Internal Server Error" on API
```bash
cd /home/yourusername/api.fmgetrainer.com
cat storage/logs/laravel.log | tail -50
```
Usually: permissions issue → run `chmod -R 755 storage`

#### "CORS Error" in browser
- Check `.env` has correct `SANCTUM_STATEFUL_DOMAINS`
- Clear config cache: `php artisan config:clear && php artisan config:cache`

#### "Database connection refused"
- Double-check database credentials in `.env`
- For cPanel MySQL, username is usually `cpaneluser_dbuser`

#### Node.js app won't start
- Check the Application Startup File is `server.js`
- Make sure `.next/static` folder is inside `.next/`
- Check error logs in cPanel → **Metrics** → **Error Log**

#### "Cannot find module" errors
- Run `npm install` again
- Make sure you uploaded the standalone build correctly

---

## PART 7: Maintenance Commands

Run these periodically via **cPanel Terminal**:

```bash
cd /home/yourusername/api.fmgetrainer.com

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations after code update
php artisan migrate --force

# Generate daily tests manually
php artisan tests:generate-daily
```

---

## PART 8: Updating Code

### When you make changes:

**Backend:**
```bash
cd /home/yourusername/api.fmgetrainer.com
git pull origin feature/fmge-daily-trainer
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

**Frontend:**
1. Build locally: `npm run build`
2. Upload new `.next/standalone` and `.next/static` to server
3. Restart Node.js app in cPanel

---

## Quick Reference

| What | URL |
|------|-----|
| Frontend | https://fmgetrainer.com |
| API | https://api.fmgetrainer.com |
| Admin Panel | https://fmgetrainer.com/admin/dashboard |
| Health Check | https://api.fmgetrainer.com/up |
| cPanel | https://fmgetrainer.com:2083 |

| Login | Email | Password |
|-------|-------|----------|
| Admin | admin@fmgetrainer.com | admin123456 |
| Student | student@fmgetrainer.com | student123456 |

---

## Need Redis? (Optional but Recommended)

If your host supports Redis:
1. Install Redis addon in cPanel (if available)
2. Update `.env`:
```env
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

If not available, the file-based cache works fine for small-medium traffic.

---

## Performance Tips for cPanel

1. **Enable OPcache:** cPanel → PHP Selector → Extensions → Enable `opcache`
2. **PHP Version:** Use PHP 8.2 or 8.3 for best performance
3. **Cron Job:** Ensure the scheduler cron is running every minute
4. **Cloudflare:** Add your domain to Cloudflare free plan for CDN + caching
5. **Gzip:** Enable in cPanel → Optimize Website → Compress All Content
