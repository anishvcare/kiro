#!/bin/bash

# Azure App Service deployment script
echo "Starting Azure deployment..."

# Navigate to backend directory
cd backend

# Install production dependencies
echo "Installing production dependencies..."
npm install --production

# Run database migrations if needed
if [ -f "node_modules/.bin/sequelize" ]; then
  echo "Running database migrations..."
  npx sequelize-cli db:migrate --env production || true
fi

echo "Deployment complete!"
