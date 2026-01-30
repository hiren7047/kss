# Deployment Files Index

This document lists all deployment-related files and their purposes.

## 📚 Documentation Files

### Main Guides
- **DEPLOYMENT_GUIDE.md** - Complete detailed deployment guide (English)
  - Step-by-step instructions
  - All configurations explained
  - Troubleshooting section
  - Security checklist

- **QUICK_DEPLOY.md** - Quick deployment checklist
  - Fast reference during deployment
  - Common commands
  - Verification steps

- **DEPLOYMENT_SUMMARY_GUJARATI.md** - Summary in Gujarati
  - Main points in Gujarati
  - Quick reference
  - Common commands

- **DEPLOYMENT_FILES_INDEX.md** - This file
  - Index of all deployment files

## ⚙️ Configuration Files

### Nginx Configurations
Location: `nginx-configs/`

- **krushnasadasahayte.org.conf** - Nginx config for main site (krushnasadasahayte.org)
  - Serves React mainsite build
  - SSL configuration
  - Static file serving
  - Optional API proxy

- **admin.krushnasadasahayte.org.conf** - Nginx config for admin panel
  - Serves React admin panel build
  - SSL configuration
  - Static file serving
  - Optional API proxy

- **api.krushnasadasahayte.org.conf** - Nginx config for API (optional)
  - Reverse proxy to backend
  - SSL configuration
  - Health check endpoint

- **README.md** - Nginx configs documentation
  - Installation instructions
  - Important notes

### Environment Variables
Location: `env-examples/`

- **backend.env.example** - Backend environment variables template
  - MongoDB configuration
  - JWT secrets
  - CORS settings
  - Razorpay keys
  - Copy to `backend/.env`

- **frontend.env.example** - Frontend environment variables template
  - API URL configuration
  - Copy to `frontend/.env.production`

- **mainsite.env.example** - Mainsite environment variables template
  - API URL configuration
  - Copy to `mainsite/.env.production`

### PM2 Configuration
- **pm2-ecosystem.config.js** - PM2 process manager config
  - Backend process configuration
  - Logging settings
  - Auto-restart settings
  - Usage: `pm2 start pm2-ecosystem.config.js`

## 🚀 Scripts

### Setup Scripts
- **setup-server.sh** - Initial server setup script
  - Installs all required software
  - Configures firewall
  - Sets up MongoDB, Node.js, Nginx, PM2, Certbot
  - Creates application directories
  - Run once before deployment

### Deployment Scripts
- **deploy.sh** - Application deployment script
  - Installs dependencies
  - Builds frontend apps
  - Restarts backend
  - Reloads Nginx
  - Run after code updates

## 📋 File Structure on VPS

After deployment, your VPS structure should be:

```
/var/www/kss/
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── logs/
│   ├── .env                    # Created from env-examples/backend.env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── dist/                   # Built files served by Nginx
│   ├── .env.production         # Created from env-examples/frontend.env.example
│   └── package.json
├── mainsite/
│   ├── src/
│   ├── dist/                   # Built files served by Nginx
│   ├── .env.production         # Created from env-examples/mainsite.env.example
│   └── package.json
└── nginx-configs/              # Copy these to /etc/nginx/sites-available/
    ├── krushnasadasahayte.org.conf
    ├── admin.krushnasadasahayte.org.conf
    └── api.krushnasadasahayte.org.conf
```

## 🔄 Deployment Workflow

### First Time Setup
1. Run `setup-server.sh` on VPS (as root/sudo)
2. Upload/clone code to `/var/www/kss`
3. Copy environment files from `env-examples/` and configure
4. Copy Nginx configs to `/etc/nginx/sites-available/`
5. Install dependencies and build
6. Configure SSL with Certbot
7. Start services with PM2

### Regular Updates
1. Update code (git pull or upload)
2. Run `deploy.sh` or follow manual steps in QUICK_DEPLOY.md
3. Verify services are running

## 📝 Important Notes

1. **Never commit .env files** - They contain sensitive information
2. **SSL certificates** - Automatically configured by Certbot
3. **Backend logs** - Check with `pm2 logs kss-backend`
4. **Nginx logs** - Located in `/var/log/nginx/`
5. **MongoDB** - Consider setting up authentication in production
6. **Backups** - Set up regular MongoDB backups
7. **Updates** - Keep system packages updated regularly

## 🔗 Related Documentation

- See `DEPLOYMENT_GUIDE.md` for detailed instructions
- See `QUICK_DEPLOY.md` for quick reference
- See `DEPLOYMENT_SUMMARY_GUJARATI.md` for Gujarati summary

## ✅ Checklist

Before deployment, ensure:
- [ ] VPS with Ubuntu 24.04 ready
- [ ] Domain DNS configured
- [ ] SSH access to VPS
- [ ] All files from this repository available
- [ ] Environment variables prepared
- [ ] MongoDB connection string ready
- [ ] JWT secret generated (use: `openssl rand -base64 32`)

---

**Last Updated:** January 2026
**Version:** 1.0
