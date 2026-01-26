# KSS Deployment Guide - Ubuntu 24.04 VPS

Complete deployment guide for KSS (Krishna Sada Sahayate) NGO Management System on Ubuntu 24.04 VPS.

## 📋 Overview

This guide covers deployment of:
1. **Backend API** - Node.js/Express API server
2. **Admin Panel** - React admin interface (admin.kss.org)
3. **Main Site** - React public website (kss.org)

## 🌐 Domain Setup

- **kss.org** → Main public website
- **admin.kss.org** → Admin panel
- **api.kss.org** → Backend API (optional, or use direct IP:port)

---

## 📦 Prerequisites

### 1. VPS Requirements
- Ubuntu 24.04 LTS
- Minimum 2GB RAM, 2 CPU cores
- 20GB+ storage
- Root or sudo access

### 2. Domain DNS Configuration

Point your domain DNS records to your VPS IP:

```
Type    Name    Value           TTL
A       @       YOUR_VPS_IP     3600
A       admin   YOUR_VPS_IP     3600
A       api     YOUR_VPS_IP     3600
```

---

## 🚀 Step 1: Initial Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Essential Tools
```bash
sudo apt install -y curl wget git build-essential ufw
```

### 1.3 Configure Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🗄️ Step 2: Install MongoDB

### 2.1 Install MongoDB
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
```

### 2.2 Secure MongoDB (Optional but Recommended)
```bash
sudo mongosh
```

In MongoDB shell:
```javascript
use admin
db.createUser({
  user: "kssadmin",
  pwd: "YOUR_STRONG_PASSWORD",
  roles: [ { role: "root", db: "admin" } ]
})
exit
```

Edit `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

---

## 🟢 Step 3: Install Node.js

### 3.1 Install Node.js 20.x (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

---

## 🌐 Step 4: Install Nginx

### 4.1 Install Nginx
```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.2 Configure Nginx

Create configuration files (see `nginx-configs/` folder for detailed configs):

**Main Site (kss.org):**
```bash
sudo nano /etc/nginx/sites-available/kss.org
```

**Admin Panel (admin.kss.org):**
```bash
sudo nano /etc/nginx/sites-available/admin.kss.org
```

**API (api.kss.org) - Optional:**
```bash
sudo nano /etc/nginx/sites-available/api.kss.org
```

Enable sites:
```bash
sudo ln -s /etc/nginx/sites-available/kss.org /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.kss.org /etc/nginx/sites-enabled/
# sudo ln -s /etc/nginx/sites-available/api.kss.org /etc/nginx/sites-enabled/
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📁 Step 5: Deploy Application Code

### 5.1 Create Application Directory
```bash
sudo mkdir -p /var/www/kss
sudo chown -R $USER:$USER /var/www/kss
cd /var/www/kss
```

### 5.2 Clone or Upload Code
```bash
# Option 1: If using Git
git clone YOUR_REPO_URL .

# Option 2: Upload via SCP/SFTP
# scp -r /path/to/KSS/* user@your-vps:/var/www/kss/
```

### 5.3 Install Dependencies

**Backend:**
```bash
cd /var/www/kss/backend
npm install --production
```

**Frontend (Admin Panel):**
```bash
cd /var/www/kss/frontend
npm install
npm run build
```

**Mainsite:**
```bash
cd /var/www/kss/mainsite
npm install
npm run build
```

---

## ⚙️ Step 6: Configure Environment Variables

### 6.1 Backend Environment (.env)
```bash
cd /var/www/kss/backend
nano .env
```

```env
# Server
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/kss_ngo
# OR if using authentication:
# MONGODB_URI=mongodb://kssadmin:YOUR_PASSWORD@localhost:27017/kss_ngo?authSource=admin

# JWT
JWT_SECRET=YOUR_VERY_STRONG_SECRET_KEY_HERE_MIN_32_CHARS
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://admin.kss.org
FRONTEND_BASE_URL=https://admin.kss.org

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Razorpay (if using)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 6.2 Frontend Environment (.env.production)
```bash
cd /var/www/kss/frontend
nano .env.production
```

```env
VITE_API_URL=https://api.kss.org/api
# OR if not using api subdomain:
# VITE_API_URL=https://kss.org/api
```

### 6.3 Mainsite Environment (.env.production)
```bash
cd /var/www/kss/mainsite
nano .env.production
```

```env
VITE_API_URL=https://api.kss.org/api
# OR if not using api subdomain:
# VITE_API_URL=https://kss.org/api
```

---

## 🔒 Step 7: SSL Certificate (Let's Encrypt)

### 7.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificates
```bash
# For main site
sudo certbot --nginx -d kss.org -d www.kss.org

# For admin panel
sudo certbot --nginx -d admin.kss.org

# For API (if using subdomain)
sudo certbot --nginx -d api.kss.org
```

Certbot will automatically configure Nginx with SSL.

### 7.3 Auto-renewal (Already enabled by default)
```bash
# Test renewal
sudo certbot renew --dry-run
```

---

## 🚀 Step 8: Start Services with PM2

### 8.1 Start Backend API
```bash
cd /var/www/kss/backend
pm2 start src/server.js --name kss-backend
pm2 save
pm2 startup
```

### 8.2 Verify Services
```bash
pm2 list
pm2 logs kss-backend
```

---

## 📝 Step 9: Nginx Configuration Files

See `nginx-configs/` directory for complete Nginx configurations:
- `kss.org.conf` - Main site configuration
- `admin.kss.org.conf` - Admin panel configuration
- `api.kss.org.conf` - API reverse proxy (optional)

---

## ✅ Step 10: Verify Deployment

### 10.1 Check Services
```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# MongoDB status
sudo systemctl status mongod
```

### 10.2 Test URLs
- https://kss.org - Main site
- https://admin.kss.org - Admin panel
- https://api.kss.org/api/health - API health check

### 10.3 Check Logs
```bash
# Backend logs
pm2 logs kss-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 Step 11: Initial Setup

### 11.1 Create Admin User
```bash
cd /var/www/kss/backend
npm run seed:admin
```

Or manually create via MongoDB or API.

### 11.2 Seed Initial Data (Optional)
```bash
cd /var/www/kss/backend
npm run seed:cms
npm run seed:transparency
npm run seed:events
```

---

## 🔄 Step 12: Update Deployment

### 12.1 Update Code
```bash
cd /var/www/kss

# Pull latest code
git pull origin main

# Or upload new files via SCP/SFTP
```

### 12.2 Rebuild Frontend Apps
```bash
# Admin Panel
cd /var/www/kss/frontend
npm install
npm run build

# Main Site
cd /var/www/kss/mainsite
npm install
npm run build
```

### 12.3 Restart Backend
```bash
cd /var/www/kss/backend
npm install --production
pm2 restart kss-backend
```

### 12.4 Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🛠️ Maintenance Commands

### PM2 Commands
```bash
pm2 list              # List all processes
pm2 logs kss-backend   # View logs
pm2 restart kss-backend # Restart backend
pm2 stop kss-backend   # Stop backend
pm2 monit              # Monitor resources
```

### Nginx Commands
```bash
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx      # Reload configuration
sudo systemctl restart nginx     # Restart Nginx
sudo systemctl status nginx      # Check status
```

### MongoDB Commands
```bash
sudo systemctl status mongod     # Check status
sudo systemctl restart mongod    # Restart MongoDB
mongosh                          # Connect to MongoDB shell
```

---

## 🔐 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] MongoDB secured with authentication
- [ ] Strong JWT_SECRET in backend .env
- [ ] SSL certificates installed
- [ ] Nginx security headers configured
- [ ] File upload directory permissions set correctly
- [ ] Regular backups configured
- [ ] PM2 auto-startup configured
- [ ] Log rotation configured

---

## 📊 Monitoring & Backups

### Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/kss
```

Add:
```
/var/www/kss/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

### MongoDB Backup Script
Create `/var/www/kss/scripts/backup-mongodb.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --out $BACKUP_DIR/kss_$DATE
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Make executable:
```bash
chmod +x /var/www/kss/scripts/backup-mongodb.sh
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /var/www/kss/scripts/backup-mongodb.sh
```

---

## 🆘 Troubleshooting

### Backend not starting
```bash
pm2 logs kss-backend
cd /var/www/kss/backend
node src/server.js  # Run directly to see errors
```

### Nginx 502 Bad Gateway
- Check if backend is running: `pm2 list`
- Check backend logs: `pm2 logs kss-backend`
- Verify backend port in Nginx config matches .env PORT

### SSL Certificate Issues
```bash
sudo certbot certificates
sudo certbot renew
```

### MongoDB Connection Issues
```bash
sudo systemctl status mongod
mongosh  # Test connection
```

---

## 📞 Support

For issues, check:
1. PM2 logs: `pm2 logs kss-backend`
2. Nginx logs: `/var/log/nginx/error.log`
3. MongoDB logs: `/var/log/mongodb/mongod.log`

---

## 📝 Notes

- Replace `YOUR_VPS_IP`, `YOUR_STRONG_PASSWORD`, etc. with actual values
- Keep `.env` files secure and never commit them to Git
- Regularly update system packages: `sudo apt update && sudo apt upgrade`
- Monitor disk space: `df -h`
- Monitor memory: `free -h`

---

**Last Updated:** January 2026
**Version:** 1.0
