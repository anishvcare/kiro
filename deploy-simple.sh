#!/bin/bash
# FMGE Daily Trainer - Simple cPanel Deploy
# Copy-paste this into your cPanel Terminal

echo "🏥 FMGE Daily Trainer Deployment"
echo "================================"

USER=$(whoami)
HOME="/home/$USER"

read -p "Main domain (e.g. fmgetrainer.com): " DOMAIN
read -p "API subdomain (e.g. api.fmgetrainer.com): " API
read -p "DB name (e.g. ${USER}_fmge): " DBNAME
read -p "DB user (e.g. ${USER}_fmge): " DBUSER
read -sp "DB password: " DBPASS
echo ""

echo ""
echo "Deploying to:"
echo "  Frontend: $HOME/public_html"
echo "  Backend: $HOME/$API"
echo ""

# Clone repo
echo "[1/6] Cloning..."
rm -rf $HOME/fmge_tmp
git clone https://github.com/anishvcare/kiro.git $HOME/fmge_tmp --branch cpanel-deploy --depth 1 2>/dev/null || {
    echo "ERROR: Cannot clone. For private repo, use:"
    echo "  git clone https://YOUR_TOKEN@github.com/anishvcare/kiro.git $HOME/fmge_tmp --branch cpanel-deploy --depth 1"
    exit 1
}

# Frontend
echo "[2/6] Frontend..."
cd $HOME/fmge_tmp/frontend/out 2>/dev/null && cp -r * $HOME/public_html/ && cp .htaccess $HOME/public_html/ 2>/dev/null

# If no out/ folder, use the zip
if [ ! -f "$HOME/public_html/index.html" ]; then
    cd $HOME/public_html
    unzip -o $HOME/fmge_tmp/fmge-frontend-cpanel.zip 2>/dev/null || echo "No pre-built frontend found"
fi

echo "  ✓ Frontend done"

# Backend
echo "[3/6] Backend..."
mkdir -p $HOME/$API
cp -r $HOME/fmge_tmp/backend/* $HOME/$API/
cp $HOME/fmge_tmp/backend/.env.example $HOME/$API/ 2>/dev/null

# Create .env
cat > $HOME/$API/.env << EOF
APP_NAME="FMGE Daily Trainer"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://$API
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=$DBNAME
DB_USERNAME=$DBUSER
DB_PASSWORD=$DBPASS
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database
SANCTUM_STATEFUL_DOMAINS=$DOMAIN,www.$DOMAIN
FRONTEND_URL=https://$DOMAIN
EOF

# .htaccess to route to public/
cat > $HOME/$API/.htaccess << 'EOF'
RewriteEngine On
RewriteRule ^(.*)$ public/$1 [L]
EOF

echo "  ✓ Backend done"

# Composer
echo "[4/6] Installing dependencies..."
cd $HOME/$API
if ! command -v composer &>/dev/null; then
    curl -sS https://getcomposer.org/installer | php 2>/dev/null
    php composer.phar install --no-dev --optimize-autoloader --no-interaction 2>&1 | tail -2
else
    composer install --no-dev --optimize-autoloader --no-interaction 2>&1 | tail -2
fi
echo "  ✓ Dependencies installed"

# Laravel setup
echo "[5/6] Setting up Laravel..."
cd $HOME/$API
PHP=$(which php)
$PHP artisan key:generate --force 2>/dev/null
chmod -R 755 storage bootstrap/cache
$PHP artisan storage:link 2>/dev/null
$PHP artisan migrate --force 2>&1 | tail -3
$PHP artisan db:seed --force 2>&1 | tail -2
$PHP artisan config:cache 2>/dev/null
$PHP artisan route:cache 2>/dev/null
echo "  ✓ Laravel ready"

# Cron
echo "[6/6] Cron..."
(crontab -l 2>/dev/null; echo "* * * * * cd $HOME/$API && $PHP artisan schedule:run >> /dev/null 2>&1") | sort -u | crontab - 2>/dev/null
echo "  ✓ Cron set"

# Cleanup
rm -rf $HOME/fmge_tmp

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Frontend: https://$DOMAIN"
echo "🔌 API: https://$API"
echo "👤 Admin: admin@fmgetrainer.com / admin123456"
echo "📱 Student: student@fmgetrainer.com / student123456"
echo ""
echo "⚠️  IMPORTANT: Make sure in cPanel:"
echo "   1. Subdomain $API points to: $HOME/$API/public"
echo "   2. SSL is enabled for both domains"
