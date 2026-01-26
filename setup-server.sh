#!/bin/bash

# KSS Server Initial Setup Script
# This script sets up the server with all required software
# Run this BEFORE deploying the application

set -e

echo "🚀 Starting KSS Server Setup..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Update system
echo -e "\n${GREEN}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential tools
echo -e "\n${GREEN}Installing essential tools...${NC}"
apt install -y curl wget git build-essential ufw

# Configure firewall
echo -e "\n${GREEN}Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Install MongoDB
echo -e "\n${GREEN}Installing MongoDB...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Node.js
echo -e "\n${GREEN}Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
echo -e "\n${GREEN}Installing PM2...${NC}"
npm install -g pm2

# Install Nginx
echo -e "\n${GREEN}Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Install Certbot
echo -e "\n${GREEN}Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

# Create application directory
echo -e "\n${GREEN}Creating application directory...${NC}"
mkdir -p /var/www/kss
chown -R $SUDO_USER:$SUDO_USER /var/www/kss

# Create logs directory
mkdir -p /var/www/kss/backend/logs
chown -R $SUDO_USER:$SUDO_USER /var/www/kss/backend/logs

# Summary
echo -e "\n${GREEN}✅ Server setup completed!${NC}"
echo -e "\n${YELLOW}Installed software:${NC}"
echo "  - MongoDB: $(mongod --version | head -n1)"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - Certbot: $(certbot --version 2>&1 | head -n1)"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Upload/clone your code to /var/www/kss"
echo "2. Configure environment variables (see env-examples/)"
echo "3. Install dependencies: cd /var/www/kss/backend && npm install"
echo "4. Copy Nginx configs from nginx-configs/ to /etc/nginx/sites-available/"
echo "5. Run deploy.sh to build and deploy"

echo -e "\n${GREEN}Setup complete!${NC}"
