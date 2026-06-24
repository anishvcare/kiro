# cPanel Terminal Deployment - Step by Step

Copy and paste these commands one by one in your cPanel Terminal.

---

## STEP 0: Set Your Variables

Change these values to match YOUR setup, then paste in terminal:

```bash
# === CHANGE THESE ===
export CPANEL_USER="yourusername"
export DOMAIN="yourdomain.com"
export API_DOMAIN="api.yourdomain.com"
export DB_NAME="${CPANEL_USER}_leadflow"
export DB_USER="${CPANEL_USER}_leadflow"
export DB_PASS="YourStrongPassword123"
export HOME_DIR="/home/${CPANEL_USER}"
export BACKEND_PATH="${HOME_DIR}/${API_DOMAIN}"
export FRONTEND_PATH="${HOME_DIR}/public_html"
```

---

## STEP 1: Clone the Repository

```bash
cd ~
git clone https://github.com/anishvcare/kiro.git kiro-source
```

---

## STEP 2: Setup Backend

```bash
# Create backend directory (match your subdomain document root)
mkdir -p ${BACKEND_PATH}

# Copy backend files
cp -r ~/kiro-source/backend/* ${BACKEND_PATH}/
cp ~/kiro-source/backend/.env.example ${BACKEND_PATH}/.env.example
cp ~/kiro-source/backend/.gitignore ${BACKEND_PATH}/.gitignore

cd ${BACKEND_PATH}
```

---

## STEP 3: Install Composer

```bash
cd ${BACKEND_PATH}

# Download Composer if not available
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    alias composer="php composer.phar"
fi

# Install Laravel dependencies (this takes 2-3 minutes)
php composer.phar install --no-dev --optimize-autoloader --no-interaction
```

If you get memory errors:
```bash
php -d memory_limit=512M composer.phar install --no-dev --optimize-autoloader --no-interaction
```

---

## STEP 4: Create .env File

```bash
cd ${BACKEND_PATH}

cat > .env << EOF
APP_NAME="LeadFlow WhatsApp CRM"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://${API_DOMAIN}
FRONTEND_URL=https://${DOMAIN}

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}

SESSION_DRIVER=database
SESSION_LIFETIME=120

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database
CACHE_PREFIX=leadflow_

EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=change-this-key

OPENAI_API_KEY=sk-change-this

MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=25
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@${DOMAIN}"
MAIL_FROM_NAME="LeadFlow CRM"
EOF

echo "✓ .env file created"
```

---

## STEP 5: Run Laravel Setup

```bash
cd ${BACKEND_PATH}

# Generate application key
php artisan key:generate --force

# Run database migrations (creates all tables)
php artisan migrate --force

# Create storage symlink
php artisan storage:link

# Cache everything for production speed
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Fix permissions
chmod -R 755 .
chmod -R 775 storage
chmod -R 775 bootstrap/cache

echo "✓ Laravel setup complete"
```

---

## STEP 6: Test Backend API

```bash
# Test if API is working
curl -s https://${API_DOMAIN}/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | head -50

# Should return: {"message":"Invalid credentials"} - that means it's working!
```

If you get an error, check:
```bash
cat ${BACKEND_PATH}/storage/logs/laravel.log | tail -50
```

---

## STEP 7: Setup Frontend

```bash
cd ~

# Check if Node.js is available
node -v

# If node is not found, check if there's a cPanel Node.js path:
ls /opt/cpanel/ea-nodejs*/bin/node 2>/dev/null
# Or use nvm if available:
source ~/.nvm/nvm.sh 2>/dev/null && nvm use 18
```

### If Node.js IS available:

```bash
# Prepare frontend
mkdir -p ~/frontend-build
cp -r ~/kiro-source/frontend/* ~/frontend-build/
cd ~/frontend-build

# Set API URL
echo "NEXT_PUBLIC_API_URL=https://${API_DOMAIN}/api" > .env.production

# Modify next.config for static export
cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
EOF

# Install and build
npm install
npm run build

# Deploy to public_html
rm -rf ${FRONTEND_PATH}/index.html ${FRONTEND_PATH}/_next
cp -r out/* ${FRONTEND_PATH}/
cp -r out/.* ${FRONTEND_PATH}/ 2>/dev/null

echo "✓ Frontend deployed"
```

### If Node.js is NOT available:

Build on your local computer instead:

```bash
# ON YOUR LOCAL MACHINE:
git clone https://github.com/anishvcare/kiro.git
cd kiro/frontend

echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api" > .env.production

# Edit next.config.ts to add: output: 'export', trailingSlash: true, images: { unoptimized: true }

npm install
npm run build

# Then upload the "out/" folder contents to public_html via cPanel File Manager
```

---

## STEP 8: Create Frontend .htaccess

```bash
cat > ${FRONTEND_PATH}/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # SPA Routing - serve index.html for all routes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# GZIP Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>
EOF

echo "✓ .htaccess created"
```

---

## STEP 9: Setup Cron Jobs

```bash
# Add cron jobs for scheduler and queue
(crontab -l 2>/dev/null; echo "
# LeadFlow - Scheduler (every minute)
* * * * * cd ${BACKEND_PATH} && php artisan schedule:run >> /dev/null 2>&1

# LeadFlow - Queue Worker (every 5 minutes)
*/5 * * * * cd ${BACKEND_PATH} && php artisan queue:work database --stop-when-empty --max-time=240 >> /dev/null 2>&1
") | crontab -

echo "✓ Cron jobs installed"
crontab -l
```

---

## STEP 10: CORS Fix (Important!)

```bash
cd ${BACKEND_PATH}

# Clear route cache and update CORS for your domain
php artisan config:clear

# Edit CORS config to allow your frontend domain
sed -i "s/'allowed_origins' => \['\*'\]/'allowed_origins' => ['https:\/\/${DOMAIN}', 'https:\/\/www.${DOMAIN}']/" config/cors.php

# Re-cache config
php artisan config:cache

echo "✓ CORS configured"
```

---

## STEP 11: Verify Everything

```bash
echo ""
echo "=== DEPLOYMENT VERIFICATION ==="
echo ""

# Check backend
echo -n "Backend API: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${API_DOMAIN}/up)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Working (HTTP ${HTTP_CODE})"
else
    echo "✗ Not responding (HTTP ${HTTP_CODE})"
fi

# Check frontend
echo -n "Frontend: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN})
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Working (HTTP ${HTTP_CODE})"
else
    echo "✗ Not responding (HTTP ${HTTP_CODE})"
fi

# Check database
echo -n "Database: "
cd ${BACKEND_PATH}
php artisan db:show 2>/dev/null && echo "✓ Connected" || echo "Check connection"

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo ""
echo "Open: https://${DOMAIN}"
echo "Register your admin account and start using!"
echo ""
```

---

## STEP 12: Cleanup

```bash
rm -rf ~/kiro-source ~/frontend-build
echo "✓ Temporary files cleaned"
```

---

## Troubleshooting Commands

```bash
# View Laravel error log
tail -50 ${BACKEND_PATH}/storage/logs/laravel.log

# Clear all caches
cd ${BACKEND_PATH}
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Re-run migrations if tables are missing
php artisan migrate --force

# Fix permissions
chmod -R 775 ${BACKEND_PATH}/storage
chmod -R 775 ${BACKEND_PATH}/bootstrap/cache

# Test database connection
php artisan tinker --execute="DB::connection()->getPdo(); echo 'Connected!';"

# Check PHP version
php -v

# Check if required extensions are loaded
php -m | grep -E "(pdo_mysql|mbstring|openssl|tokenizer|xml|ctype|json|bcmath)"
```

---

## Quick Fix: If You See 403/500 Error

```bash
# Fix document root - make sure public/ is the web root
# In cPanel, change the subdomain document root to:
# /home/username/api.yourdomain.com/public

# Or create symlink:
cd ${BACKEND_PATH}
ln -sf public/index.php index.php

# Alternative: Add .htaccess to redirect to public/
cat > ${BACKEND_PATH}/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
EOF
```
