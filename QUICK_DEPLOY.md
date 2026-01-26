# Quick Deployment Checklist

Use this as a quick reference during deployment.

## Pre-Deployment

- [ ] VPS with Ubuntu 24.04 ready
- [ ] Domain DNS records configured:
  - [ ] A record for `kss.org` → VPS IP
  - [ ] A record for `admin.kss.org` → VPS IP
  - [ ] A record for `api.kss.org` → VPS IP (optional)
- [ ] SSH access to VPS
- [ ] Code uploaded/cloned to VPS

## Installation Steps

### 1. System Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
```

### 2. MongoDB
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod
```

### 3. Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 4. Nginx
```bash
sudo apt install -y nginx
```

### 5. Deploy Code
```bash
# Create directory
sudo mkdir -p /var/www/kss
sudo chown -R $USER:$USER /var/www/kss
cd /var/www/kss
# git clone creates kss/ subfolder → app root = /var/www/kss/kss

# git clone https://github.com/hiren7047/kss.git  → creates kss/
# Then:
cd kss/backend && npm install
cd ../frontend && npm install && npm run build
cd ../mainsite && npm install && npm run build
```

### 6. Configure Environment
```bash
# Backend
cd /var/www/kss/kss/backend
cp ../env-examples/backend.env.example .env
nano .env  # Edit with your values

# Frontend
cd /var/www/kss/kss/frontend
cp ../env-examples/frontend.env.example .env.production
nano .env.production  # Edit API URL

# Mainsite
cd /var/www/kss/kss/mainsite
cp ../env-examples/mainsite.env.example .env.production
nano .env.production  # Edit API URL
```

### 7. Nginx Configuration
```bash
# Copy configs from repo (do NOT create with nano)
sudo cp /var/www/kss/kss/nginx-configs/kss.org.conf /etc/nginx/sites-available/kss.org
sudo cp /var/www/kss/kss/nginx-configs/admin.kss.org.conf /etc/nginx/sites-available/admin.kss.org
# Optional: sudo cp .../api.kss.org.conf /etc/nginx/sites-available/api.kss.org

# Remove default & broken symlinks, then enable
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/kss.org /etc/nginx/sites-enabled/admin.kss.org
sudo ln -s /etc/nginx/sites-available/kss.org /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.kss.org /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### 8. SSL Certificates
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kss.org -d www.kss.org
sudo certbot --nginx -d admin.kss.org
# Optional: sudo certbot --nginx -d api.kss.org
```

### 9. Start Backend
```bash
cd /var/www/kss/kss/backend
pm2 start src/server.js --name kss-backend
pm2 save
pm2 startup
```

### 10. Create Admin User
```bash
cd /var/www/kss/kss/backend
npm run seed:admin
```

## Verification

- [ ] https://kss.org loads main site
- [ ] https://admin.kss.org loads admin panel
- [ ] https://api.kss.org/api/health returns success (if configured)
- [ ] Can login to admin panel
- [ ] Backend logs show no errors: `pm2 logs kss-backend`

## Common Issues

**502 Bad Gateway:**
- Check backend is running: `pm2 list`
- Check backend logs: `pm2 logs kss-backend`
- Verify PORT in .env matches Nginx proxy

**SSL Certificate Error:**
- Run: `sudo certbot certificates`
- Renew if needed: `sudo certbot renew`

**MongoDB Connection Error:**
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify MONGODB_URI in backend .env

## Update Deployment

Use the deploy script:
```bash
cd /var/www/kss/kss
chmod +x deploy.sh
./deploy.sh
```

Or manually:
```bash
cd /var/www/kss/kss
git pull  # or upload new files
cd frontend && npm install && npm run build
cd ../mainsite && npm install && npm run build
cd ../backend && npm install
pm2 restart kss-backend
sudo nginx -t && sudo systemctl reload nginx
```
