#!/bin/bash
#===============================================
# FMGE Daily Trainer - cPanel Deployment Script
# Run this from your cPanel Terminal / SSH
#===============================================
# 
# USAGE:
#   bash deploy-cpanel.sh
#
# PREREQUISITES:
#   - cPanel hosting with SSH/Terminal access
#   - PHP 8.1+ installed
#   - A domain pointed to your hosting
#
# This script will:
#   1. Clone the repository
#   2. Setup Laravel backend on api subdomain
#   3. Deploy static frontend to public_html
#   4. Configure database
#   5. Setup cron jobs
#===============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║    FMGE Daily Trainer - Deployer v1.0    ║"
echo "║    cPanel Auto-Deployment Script         ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

#===============================================
# CONFIGURATION - EDIT THESE VALUES
#===============================================
echo -e "${YELLOW}⚙️  Configuration${NC}"
echo ""

# Auto-detect username
CPANEL_USER=$(whoami)
HOME_DIR="/home/$CPANEL_USER"

echo "Detected cPanel user: $CPANEL_USER"
echo "Home directory: $HOME_DIR"
echo ""

# Ask user for configuration
read -p "Enter your MAIN domain (e.g., fmgetrainer.com): " MAIN_DOMAIN
read -p "Enter your API subdomain (e.g., api.fmgetrainer.com): " API_DOMAIN
echo ""
read -p "Enter database name (e.g., ${CPANEL_USER}_fmge): " DB_NAME
read -p "Enter database username (e.g., ${CPANEL_USER}_fmge): " DB_USER
read -sp "Enter database password: " DB_PASS
echo ""
echo ""

# Paths
FRONTEND_PATH="$HOME_DIR/public_html"
BACKEND_PATH="$HOME_DIR/$API_DOMAIN"
REPO_URL="https://github.com/anishvcare/kiro.git"
BRANCH="feature/fmge-daily-trainer"

echo -e "${BLUE}📋 Deployment Plan:${NC}"
echo "   Frontend → $FRONTEND_PATH"
echo "   Backend  → $BACKEND_PATH"
echo "   Database → $DB_NAME"
echo "   API URL  → https://$API_DOMAIN"
echo ""
read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 Starting deployment...${NC}"
echo ""

#===============================================
# STEP 1: Clone Repository
#===============================================
echo -e "${BLUE}[1/8] Cloning repository...${NC}"

TEMP_DIR="$HOME_DIR/fmge_temp_$$"
if [ -d "$TEMP_DIR" ]; then rm -rf "$TEMP_DIR"; fi

git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$TEMP_DIR" 2>/dev/null
echo -e "${GREEN}  ✓ Repository cloned${NC}"

#===============================================
# STEP 2: Deploy Frontend (Static Files)
#===============================================
echo -e "${BLUE}[2/8] Deploying frontend...${NC}"

# Backup existing public_html (just the index)
if [ -f "$FRONTEND_PATH/index.html" ]; then
    mv "$FRONTEND_PATH/index.html" "$FRONTEND_PATH/index.html.bak.$(date +%s)" 2>/dev/null || true
fi

# Check if we have pre-built static files
if [ -f "$TEMP_DIR/fmge-frontend-cpanel.zip" ]; then
    cd "$FRONTEND_PATH"
    unzip -o "$TEMP_DIR/fmge-frontend-cpanel.zip" -d "$FRONTEND_PATH/" > /dev/null 2>&1
    echo -e "${GREEN}  ✓ Frontend deployed from pre-built ZIP${NC}"
else
    # If no zip, check if Node.js is available to build
    if command -v node &> /dev/null; then
        echo "  Building frontend from source..."
        cd "$TEMP_DIR/frontend"
        
        # Create production env
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://$API_DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$MAIN_DOMAIN
EOF
        npm install --production=false 2>/dev/null
        npm run build 2>/dev/null
        
        # Copy static output
        cp -r out/* "$FRONTEND_PATH/"
        echo -e "${GREEN}  ✓ Frontend built and deployed${NC}"
    else
        # Copy pre-built out folder if exists
        if [ -d "$TEMP_DIR/frontend/out" ]; then
            cp -r "$TEMP_DIR/frontend/out/"* "$FRONTEND_PATH/"
            echo -e "${GREEN}  ✓ Frontend deployed from out/ folder${NC}"
        else
            echo -e "${RED}  ✗ Cannot deploy frontend. No Node.js available and no pre-built files.${NC}"
            echo -e "${YELLOW}    Download fmge-frontend-cpanel.zip from GitHub and upload manually.${NC}"
        fi
    fi
fi

# Create/update .htaccess for frontend
cat > "$FRONTEND_PATH/.htaccess" << 'HTACCESS'
# FMGE Daily Trainer - Frontend Routing
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1/index.html [L]

# Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

# Cache static assets (1 month)
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/font-woff2 "access plus 1 month"
</IfModule>

# Security
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
HTACCESS

echo -e "${GREEN}  ✓ .htaccess configured${NC}"

#===============================================
# STEP 3: Deploy Backend (Laravel)
#===============================================
echo -e "${BLUE}[3/8] Deploying Laravel backend...${NC}"

# Create API directory if not exists
mkdir -p "$BACKEND_PATH"

# Copy backend files
cp -r "$TEMP_DIR/backend/"* "$BACKEND_PATH/"
cp "$TEMP_DIR/backend/.env.example" "$BACKEND_PATH/.env.example" 2>/dev/null || true
cp "$TEMP_DIR/backend/.gitignore" "$BACKEND_PATH/.gitignore" 2>/dev/null || true

echo -e "${GREEN}  ✓ Backend files copied${NC}"

#===============================================
# STEP 4: Configure Laravel .env
#===============================================
echo -e "${BLUE}[4/8] Configuring environment...${NC}"

cd "$BACKEND_PATH"

cat > .env << EOF
APP_NAME="FMGE Daily Trainer"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://$API_DOMAIN

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=$DB_NAME
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASS

# Cache & Session (file-based for shared hosting)
CACHE_STORE=file
SESSION_DRIVER=file
SESSION_LIFETIME=120
QUEUE_CONNECTION=database

# CORS - Allow frontend domain
SANCTUM_STATEFUL_DOMAINS=$MAIN_DOMAIN,www.$MAIN_DOMAIN
FRONTEND_URL=https://$MAIN_DOMAIN

# Mail (configure later)
MAIL_MAILER=smtp
MAIL_HOST=mail.$MAIN_DOMAIN
MAIL_PORT=465
MAIL_USERNAME=noreply@$MAIN_DOMAIN
MAIL_PASSWORD=
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@$MAIN_DOMAIN
MAIL_FROM_NAME="FMGE Trainer"
EOF

echo -e "${GREEN}  ✓ .env configured${NC}"

#===============================================
# STEP 5: Install Composer & Dependencies
#===============================================
echo -e "${BLUE}[5/8] Installing PHP dependencies...${NC}"

cd "$BACKEND_PATH"

# Check if composer exists
if ! command -v composer &> /dev/null; then
    # Install composer locally
    curl -sS https://getcomposer.org/installer | php 2>/dev/null
    COMPOSER_CMD="php composer.phar"
else
    COMPOSER_CMD="composer"
fi

$COMPOSER_CMD install --no-dev --optimize-autoloader --no-interaction 2>&1 | tail -3

echo -e "${GREEN}  ✓ Dependencies installed${NC}"

#===============================================
# STEP 6: Laravel Setup
#===============================================
echo -e "${BLUE}[6/8] Setting up Laravel...${NC}"

cd "$BACKEND_PATH"

# Detect PHP path
PHP_PATH=$(which php 2>/dev/null || echo "/usr/local/bin/php")

# Generate app key
$PHP_PATH artisan key:generate --force 2>/dev/null
echo "  ✓ App key generated"

# Set permissions
chmod -R 755 storage bootstrap/cache
echo "  ✓ Permissions set"

# Create storage link
$PHP_PATH artisan storage:link 2>/dev/null || true
echo "  ✓ Storage linked"

# Run migrations
echo "  Running migrations..."
$PHP_PATH artisan migrate --force 2>&1 | tail -5
echo -e "${GREEN}  ✓ Database migrated${NC}"

# Seed data (subjects, questions, admin user)
echo "  Seeding database..."
$PHP_PATH artisan db:seed --force 2>&1 | tail -3
echo -e "${GREEN}  ✓ Database seeded (admin + questions + subjects)${NC}"

# Cache for production
$PHP_PATH artisan config:cache 2>/dev/null
$PHP_PATH artisan route:cache 2>/dev/null
$PHP_PATH artisan view:cache 2>/dev/null
echo -e "${GREEN}  ✓ Configuration cached${NC}"

#===============================================
# STEP 7: Configure API .htaccess (point to public/)
#===============================================
echo -e "${BLUE}[7/8] Configuring API routing...${NC}"

# Check if document root points to public/
# If not, create .htaccess to redirect
if [ ! -f "$BACKEND_PATH/public/.htaccess" ]; then
    cat > "$BACKEND_PATH/public/.htaccess" << 'HTACCESS'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect to public/index.php
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# CORS Headers
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "https://MAIN_DOMAIN_PLACEHOLDER"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept"
    Header always set Access-Control-Allow-Credentials "true"

    # Handle preflight OPTIONS
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
HTACCESS
fi

# Replace placeholder with actual domain
sed -i "s/MAIN_DOMAIN_PLACEHOLDER/$MAIN_DOMAIN/g" "$BACKEND_PATH/public/.htaccess"

# Also create root .htaccess to point to public/
cat > "$BACKEND_PATH/.htaccess" << 'HTACCESS'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
HTACCESS

echo -e "${GREEN}  ✓ API routing configured${NC}"

#===============================================
# STEP 8: Setup Cron Job
#===============================================
echo -e "${BLUE}[8/8] Setting up cron job...${NC}"

# Add Laravel scheduler to crontab
CRON_CMD="* * * * * cd $BACKEND_PATH && $PHP_PATH artisan schedule:run >> /dev/null 2>&1"

# Check if cron already exists
(crontab -l 2>/dev/null | grep -v "artisan schedule:run"; echo "$CRON_CMD") | crontab - 2>/dev/null || {
    echo -e "${YELLOW}  ⚠ Could not auto-add cron. Please add manually in cPanel:${NC}"
    echo "     $CRON_CMD"
}
echo -e "${GREEN}  ✓ Cron job configured${NC}"

#===============================================
# CLEANUP
#===============================================
echo ""
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -rf "$TEMP_DIR"
echo -e "${GREEN}  ✓ Temp files removed${NC}"

#===============================================
# DONE!
#===============================================
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║          🎉 DEPLOYMENT COMPLETE! 🎉                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}🌐 Your App URLs:${NC}"
echo "   Frontend:    https://$MAIN_DOMAIN"
echo "   API:         https://$API_DOMAIN"
echo "   Admin Panel: https://$MAIN_DOMAIN/admin/dashboard/"
echo ""
echo -e "${BLUE}🔑 Login Credentials:${NC}"
echo "   Admin:   admin@fmgetrainer.com / admin123456"
echo "   Student: student@fmgetrainer.com / student123456"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT - Do these manually:${NC}"
echo ""
echo "   1. In cPanel → Domains/Subdomains:"
echo "      Make sure $API_DOMAIN points to:"
echo "      $BACKEND_PATH/public"
echo ""
echo "   2. In cPanel → SSL/TLS:"
echo "      Enable SSL for both domains"
echo ""
echo "   3. Change default passwords after first login!"
echo ""
echo -e "${GREEN}✅ All done! Your FMGE Daily Trainer is ready.${NC}"
echo ""
