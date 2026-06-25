#!/bin/bash
# ============================================================
# LeadFlow WhatsApp CRM - cPanel Deployment Script
# Run this from cPanel Terminal (or SSH)
# ============================================================

# ===================== CONFIGURATION ========================
# CHANGE THESE VALUES TO MATCH YOUR SETUP:

CPANEL_USER="yourusername"          # Your cPanel username
DOMAIN="yourdomain.com"             # Your main domain
API_DOMAIN="api.yourdomain.com"     # API subdomain
HOME_DIR="/home/${CPANEL_USER}"

# Database
DB_NAME="${CPANEL_USER}_leadflow"
DB_USER="${CPANEL_USER}_leadflow"
DB_PASS="YourStrongPassword123!"

# Paths
BACKEND_PATH="${HOME_DIR}/${API_DOMAIN}"
FRONTEND_PATH="${HOME_DIR}/public_html"

# API Keys (replace with your actual keys)
OPENAI_KEY="sk-your-openai-api-key"
EVOLUTION_URL="https://wa.yourdomain.com"  # Or your Evolution API URL
EVOLUTION_KEY="your-evolution-api-key"

# ============================================================
echo "============================================"
echo " LeadFlow CRM - cPanel Deployment"
echo "============================================"
echo ""

# ===================== BACKEND SETUP ========================
echo "[1/8] Setting up Backend (Laravel)..."
echo "--------------------------------------"

cd ${HOME_DIR}

# Clone repository
if [ -d "kiro-temp" ]; then
    rm -rf kiro-temp
fi
git clone https://github.com/anishvcare/kiro.git kiro-temp

# Copy backend files
if [ -d "${BACKEND_PATH}" ]; then
    # Backup existing
    mv ${BACKEND_PATH} ${BACKEND_PATH}_backup_$(date +%Y%m%d)
fi
mkdir -p ${BACKEND_PATH}
cp -r kiro-temp/backend/* ${BACKEND_PATH}/
cp kiro-temp/backend/.* ${BACKEND_PATH}/ 2>/dev/null

echo "[1/8] Backend files copied ✓"

# ===================== COMPOSER INSTALL =====================
echo ""
echo "[2/8] Installing PHP Dependencies..."
echo "--------------------------------------"

cd ${BACKEND_PATH}

# Check if composer exists
if ! command -v composer &> /dev/null; then
    echo "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar ~/bin/composer 2>/dev/null || mv composer.phar /usr/local/bin/composer 2>/dev/null
    alias composer="php composer.phar"
fi

# Use specific PHP version if available
PHP_BIN=$(which php)
if [ -f "/usr/local/bin/ea-php83" ]; then
    PHP_BIN="/usr/local/bin/ea-php83"
elif [ -f "/opt/cpanel/ea-php83/root/usr/bin/php" ]; then
    PHP_BIN="/opt/cpanel/ea-php83/root/usr/bin/php"
elif [ -f "/opt/cpanel/ea-php82/root/usr/bin/php" ]; then
    PHP_BIN="/opt/cpanel/ea-php82/root/usr/bin/php"
fi

echo "Using PHP: ${PHP_BIN}"
${PHP_BIN} -v

# Install dependencies
export COMPOSER_ALLOW_SUPERUSER=1
${PHP_BIN} $(which composer 2>/dev/null || echo "composer.phar") install --no-dev --optimize-autoloader --no-interaction 2>&1

echo "[2/8] Composer dependencies installed ✓"

# ===================== ENVIRONMENT FILE =====================
echo ""
echo "[3/8] Creating Environment Configuration..."
echo "--------------------------------------"

cat > ${BACKEND_PATH}/.env << ENVFILE
APP_NAME="LeadFlow WhatsApp CRM"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://${API_DOMAIN}
FRONTEND_URL=https://${DOMAIN}

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US
APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database
CACHE_PREFIX=leadflow_

REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# WhatsApp Evolution API
EVOLUTION_API_URL=${EVOLUTION_URL}
EVOLUTION_API_KEY=${EVOLUTION_KEY}

# OpenAI
OPENAI_API_KEY=${OPENAI_KEY}

# Mail (cPanel email)
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=25
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@${DOMAIN}"
MAIL_FROM_NAME="LeadFlow CRM"
ENVFILE

echo "[3/8] Environment file created ✓"

# ===================== LARAVEL SETUP ========================
echo ""
echo "[4/8] Running Laravel Setup Commands..."
echo "--------------------------------------"

cd ${BACKEND_PATH}

# Generate app key
${PHP_BIN} artisan key:generate --force
echo "  → App key generated"

# Run migrations
${PHP_BIN} artisan migrate --force
echo "  → Database migrated"

# Create storage link
${PHP_BIN} artisan storage:link 2>/dev/null
echo "  → Storage linked"

# Cache for production
${PHP_BIN} artisan config:cache
${PHP_BIN} artisan route:cache
${PHP_BIN} artisan view:cache
echo "  → Config/routes/views cached"

# Set permissions
chmod -R 755 ${BACKEND_PATH}
chmod -R 775 ${BACKEND_PATH}/storage
chmod -R 775 ${BACKEND_PATH}/bootstrap/cache
echo "  → Permissions set"

echo "[4/8] Laravel setup complete ✓"

# ===================== FRONTEND SETUP =======================
echo ""
echo "[5/8] Setting up Frontend (Next.js)..."
echo "--------------------------------------"

cd ${HOME_DIR}

# Copy frontend files
mkdir -p ${HOME_DIR}/frontend-build
cp -r kiro-temp/frontend/* ${HOME_DIR}/frontend-build/
cp kiro-temp/frontend/.* ${HOME_DIR}/frontend-build/ 2>/dev/null

cd ${HOME_DIR}/frontend-build

# Create production environment
cat > .env.production << FRONTENV
NEXT_PUBLIC_API_URL=https://${API_DOMAIN}/api
NEXT_PUBLIC_APP_NAME=LeadFlow WhatsApp CRM
NEXT_PUBLIC_APP_URL=https://${DOMAIN}
FRONTENV

# Check for Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "Node.js found: ${NODE_VERSION}"
else
    echo "WARNING: Node.js not found!"
    echo "You need to:"
    echo "  1. Go to cPanel → Setup Node.js App"
    echo "  2. Create a Node.js app for your domain"
    echo "  3. Then re-run the frontend build portion"
fi

echo "[5/8] Frontend files prepared ✓"

# ===================== BUILD FRONTEND =======================
echo ""
echo "[6/8] Building Frontend..."
echo "--------------------------------------"

cd ${HOME_DIR}/frontend-build

if command -v node &> /dev/null; then
    # Install dependencies
    npm install --production=false 2>&1 | tail -5
    
    # Build for static export
    # Add static export config
    cat > next.config.ts << 'NEXTCONFIG'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
NEXTCONFIG

    # Build
    npm run build 2>&1 | tail -10
    
    # Copy static files to public_html
    if [ -d "out" ]; then
        rm -rf ${FRONTEND_PATH}/*
        cp -r out/* ${FRONTEND_PATH}/
        cp -r out/.* ${FRONTEND_PATH}/ 2>/dev/null
        echo "  → Static files deployed to public_html"
    else
        echo "  WARNING: Build output not found. Manual build needed."
    fi
else
    echo "  Skipping build - Node.js not available in terminal."
    echo "  See alternative instructions below."
fi

echo "[6/8] Frontend build complete ✓"

# ===================== HTACCESS SETUP =======================
echo ""
echo "[7/8] Creating .htaccess files..."
echo "--------------------------------------"

# Frontend .htaccess (for SPA routing)
cat > ${FRONTEND_PATH}/.htaccess << 'HTACCESS'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    
    # Redirect to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Don't rewrite files or directories
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Rewrite everything else to index.html (SPA)
    RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# Enable GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>
HTACCESS

# Backend .htaccess is already in public/ from Laravel
echo "[7/8] .htaccess files created ✓"

# ===================== CRON JOBS ============================
echo ""
echo "[8/8] Setting up Cron Jobs..."
echo "--------------------------------------"

# Add cron jobs
CRON_FILE="/tmp/leadflow_cron"
crontab -l > ${CRON_FILE} 2>/dev/null

# Check if already added
if ! grep -q "leadflow" ${CRON_FILE}; then
    echo "" >> ${CRON_FILE}
    echo "# LeadFlow CRM - Laravel Scheduler (every minute)" >> ${CRON_FILE}
    echo "* * * * * cd ${BACKEND_PATH} && ${PHP_BIN} artisan schedule:run >> /dev/null 2>&1" >> ${CRON_FILE}
    echo "" >> ${CRON_FILE}
    echo "# LeadFlow CRM - Queue Worker (every 5 minutes)" >> ${CRON_FILE}
    echo "*/5 * * * * cd ${BACKEND_PATH} && ${PHP_BIN} artisan queue:work database --stop-when-empty --max-time=240 >> /dev/null 2>&1" >> ${CRON_FILE}
    
    crontab ${CRON_FILE}
    echo "  → Cron jobs installed"
else
    echo "  → Cron jobs already exist"
fi
rm -f ${CRON_FILE}

echo "[8/8] Cron jobs setup complete ✓"

# ===================== CLEANUP ==============================
echo ""
echo "============================================"
echo " Cleaning up..."
echo "============================================"

rm -rf ${HOME_DIR}/kiro-temp

# ===================== SUMMARY ==============================
echo ""
echo "============================================"
echo " DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo " Frontend: https://${DOMAIN}"
echo " Backend:  https://${API_DOMAIN}"
echo " API Base: https://${API_DOMAIN}/api"
echo ""
echo "============================================"
echo " NEXT STEPS:"
echo "============================================"
echo ""
echo " 1. Open https://${DOMAIN} in your browser"
echo " 2. Register your admin account"
echo " 3. Go to WhatsApp Accounts → Connect Number"
echo " 4. Scan QR code with your phone"
echo ""
echo " If frontend shows blank page:"
echo "   - Ensure Node.js build completed"
echo "   - Check browser console for errors"
echo ""
echo " If API returns 500:"
echo "   - Check: ${BACKEND_PATH}/storage/logs/laravel.log"
echo "   - Verify DB credentials in .env"
echo ""
echo " Evolution API (WhatsApp):"
echo "   - Needs separate VPS or Docker host"
echo "   - Set EVOLUTION_API_URL in backend .env"
echo ""
echo "============================================"
