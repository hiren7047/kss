#!/bin/bash

# KSS Deployment Script
# This script automates the deployment process on Ubuntu 24.04 VPS

set -e  # Exit on error

echo "🚀 Starting KSS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (git clone creates kss/ subfolder)
APP_DIR="/var/www/kss/kss"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
MAINSITE_DIR="$APP_DIR/mainsite"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Some commands may require sudo. You may be prompted for password.${NC}"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${GREEN}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 20.x first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

if ! command_exists pm2; then
    echo -e "${YELLOW}PM2 is not installed. Installing...${NC}"
    sudo npm install -g pm2
fi

if ! command_exists nginx; then
    echo -e "${YELLOW}Nginx is not installed. Please install Nginx first.${NC}"
    exit 1
fi

# Navigate to app directory
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Application directory $APP_DIR does not exist!${NC}"
    echo "Expected /var/www/kss/kss (after: git clone ... /var/www/kss)"
    exit 1
fi

cd "$APP_DIR"

# Deploy Backend
echo -e "\n${GREEN}Deploying Backend...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Please create it before deploying.${NC}"
    echo "See DEPLOYMENT_GUIDE.md for required environment variables."
fi

cd "$BACKEND_DIR"
echo "Installing backend dependencies..."
npm install
echo "Restarting backend with PM2..."
pm2 restart kss-backend || pm2 start src/server.js --name kss-backend
pm2 save

# Deploy Frontend (Admin Panel)
echo -e "\n${GREEN}Deploying Admin Panel (Frontend)...${NC}"
cd "$FRONTEND_DIR"

echo "Installing frontend dependencies..."
npm install

echo "Building frontend for production..."
npm run build

# Deploy Mainsite
echo -e "\n${GREEN}Deploying Main Site...${NC}"
cd "$MAINSITE_DIR"

echo "Installing mainsite dependencies..."
npm install

echo "Building mainsite for production..."
npm run build

# Reload Nginx
echo -e "\n${GREEN}Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

# Show status
echo -e "\n${GREEN}Deployment Complete!${NC}"
echo -e "\n${GREEN}Service Status:${NC}"
pm2 list

echo -e "\n${GREEN}Checking services...${NC}"
echo "Backend:"
pm2 logs kss-backend --lines 5 --nostream

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Verify services are running: pm2 list"
echo "2. Check logs: pm2 logs kss-backend"
echo "3. Test URLs:"
echo "   - https://krushnasadasahayte.org"
echo "   - https://admin.krushnasadasahayte.org"
echo "   - https://api.krushnasadasahayte.org/api/health (if configured)"

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
