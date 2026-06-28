#!/bin/bash
# cPanel Deployment Script for Local Shopping & Delivery Platform
# Usage: ./cPanel-deploy.sh

set -e

echo "==========================================="
echo " Local Shopping Platform - Deploy Script"
echo "==========================================="

# Configuration
DEPLOY_DIR="${DEPLOY_DIR:-/home/$USER/localshop-api}"
FRONTEND_DIR="${FRONTEND_DIR:-/home/$USER/public_html}"
BACKUP_DIR="${BACKUP_DIR:-/home/$USER/backups}"
DB_NAME="${DB_NAME:-localshop_db}"
NODE_VERSION="${NODE_VERSION:-18}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Step 1: Create backup
log_info "Creating backup..."
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -d "$DEPLOY_DIR" ]; then
    tar -czf "$BACKUP_DIR/backend_$TIMESTAMP.tar.gz" -C "$DEPLOY_DIR" . 2>/dev/null || true
    log_info "Backend backup created: backend_$TIMESTAMP.tar.gz"
fi

# Step 2: Deploy Backend
log_info "Deploying backend..."
mkdir -p "$DEPLOY_DIR"

# Copy backend files (excluding node_modules and .env)
rsync -av --exclude='node_modules' --exclude='.env' --exclude='uploads/*' \
    ./backend/ "$DEPLOY_DIR/" 2>/dev/null || cp -r ./backend/* "$DEPLOY_DIR/"

# Install production dependencies
cd "$DEPLOY_DIR"
if command -v npm &> /dev/null; then
    log_info "Installing backend dependencies..."
    npm install --production --legacy-peer-deps
else
    log_error "npm not found. Please install Node.js $NODE_VERSION+"
    exit 1
fi

# Create upload directories
mkdir -p "$DEPLOY_DIR/uploads/products"
mkdir -p "$DEPLOY_DIR/uploads/avatars"
mkdir -p "$DEPLOY_DIR/uploads/documents"
mkdir -p "$DEPLOY_DIR/uploads/chat"
chmod -R 755 "$DEPLOY_DIR/uploads"

# Step 3: Deploy Frontend
log_info "Building and deploying frontend..."
cd "$(dirname "$0")/frontend"

if [ -f "package.json" ]; then
    npm install
    npm run build

    # Copy built files to public_html
    mkdir -p "$FRONTEND_DIR"
    cp -r dist/* "$FRONTEND_DIR/"

    # Create .htaccess for SPA routing
    cat > "$FRONTEND_DIR/.htaccess" << 'HTACCESS'
RewriteEngine On
RewriteBase /

# Serve static files directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Route all other requests to index.html (SPA)
RewriteRule ^ /index.html [L]
HTACCESS

    log_info "Frontend deployed to $FRONTEND_DIR"
else
    log_warn "Frontend package.json not found, skipping frontend build"
fi

# Step 4: Database migration
log_info "Checking database..."
if command -v mysql &> /dev/null; then
    if [ -f "$(dirname "$0")/database/schema.sql" ]; then
        log_info "Database schema file found. Import manually if needed:"
        log_info "  mysql -u \$DB_USER -p $DB_NAME < database/schema.sql"
    fi
else
    log_warn "MySQL client not found. Import schema manually via phpMyAdmin."
fi

# Step 5: Set permissions
log_info "Setting file permissions..."
chmod 644 "$DEPLOY_DIR/.env" 2>/dev/null || true
chmod -R 755 "$DEPLOY_DIR/uploads"
chmod 755 "$DEPLOY_DIR/server.js"

# Step 6: Restart application
log_info "Restarting application..."
if [ -d "$DEPLOY_DIR/tmp" ]; then
    touch "$DEPLOY_DIR/tmp/restart.txt"
    log_info "Application restart triggered"
else
    mkdir -p "$DEPLOY_DIR/tmp"
    touch "$DEPLOY_DIR/tmp/restart.txt"
    log_info "Application restart triggered (created tmp directory)"
fi

echo ""
echo "==========================================="
log_info "Deployment complete!"
echo "==========================================="
echo ""
echo "Next steps:"
echo "  1. Verify backend: curl https://api.yourdomain.com/api/health"
echo "  2. Verify frontend: Visit https://yourdomain.com"
echo "  3. Check API docs: https://api.yourdomain.com/api-docs"
echo "  4. Monitor logs for errors"
echo ""
