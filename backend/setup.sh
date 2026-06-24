#!/bin/bash
# FMGE Daily Trainer - Backend Setup Script for cPanel
# Run this after uploading files to your cPanel hosting
# Usage: bash setup.sh

echo "🏥 FMGE Daily Trainer - Backend Setup"
echo "======================================"

# Check PHP version
PHP_VERSION=$(php -v | head -1 | awk '{print $2}')
echo "✓ PHP Version: $PHP_VERSION"

# Install Composer if not available
if ! command -v composer &> /dev/null; then
    echo "📦 Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar ~/bin/composer 2>/dev/null || mv composer.phar /usr/local/bin/composer 2>/dev/null
    echo "✓ Composer installed"
fi

# Install dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
echo "✓ Dependencies installed"

# Setup environment
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  .env file created. Please edit it with your database credentials!"
    echo "   Run: nano .env"
    echo ""
fi

# Generate app key
php artisan key:generate --force
echo "✓ Application key generated"

# Set permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
echo "✓ Permissions set"

# Create storage link
php artisan storage:link 2>/dev/null
echo "✓ Storage linked"

echo ""
echo "======================================"
echo "⚠️  NEXT STEPS:"
echo "======================================"
echo ""
echo "1. Edit your .env file with database credentials:"
echo "   nano .env"
echo ""
echo "2. After editing .env, run:"
echo "   php artisan migrate --force"
echo "   php artisan db:seed --force"
echo ""
echo "3. Cache configuration:"
echo "   php artisan config:cache"
echo "   php artisan route:cache"
echo "   php artisan view:cache"
echo ""
echo "4. Add this cron job in cPanel:"
echo "   * * * * * cd $(pwd) && php artisan schedule:run >> /dev/null 2>&1"
echo ""
echo "5. Test your API:"
echo "   curl https://your-api-domain.com/up"
echo ""
echo "✅ Setup complete!"
