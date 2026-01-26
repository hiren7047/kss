# KSS Deployment - સારાંશ (Summary in Gujarati)

## 📋 મુખ્ય માહિતી

તમારી પાસે 3 applications છે:
1. **Backend API** - Node.js/Express server (port 3000 પર ચાલશે)
2. **Admin Panel** - React admin interface (admin.kss.org પર)
3. **Main Site** - React public website (kss.org પર)

## 🌐 Domain Setup

- **kss.org** → Main public website (mainsite)
- **admin.kss.org** → Admin panel (frontend)
- **api.kss.org** → Backend API (optional)

## 🚀 મુખ્ય Steps

### 1. VPS Setup
- Ubuntu 24.04 LTS VPS
- Minimum 2GB RAM, 2 CPU cores
- Domain DNS records VPS IP પર point કરો

### 2. Install કરવાની જરૂરી વસ્તુઓ
- MongoDB (Database)
- Node.js 20.x
- Nginx (Web server)
- PM2 (Process manager)
- Certbot (SSL certificates માટે)

### 3. Code Deploy કરવું
- Code `/var/www/kss` માં upload/clone કરો
- Dependencies install કરો
- Build frontend અને mainsite

### 4. Configuration
- Backend `.env` file setup કરો
- Frontend `.env.production` setup કરો
- Mainsite `.env.production` setup કરો
- Nginx configuration files copy કરો

### 5. SSL Certificates
- Let's Encrypt SSL certificates install કરો
- Automatic HTTPS enable થશે

### 6. Start Services
- Backend PM2 સાથે start કરો
- Nginx reload કરો

## 📁 Important Files

### Configuration Files:
- `DEPLOYMENT_GUIDE.md` - Complete detailed guide (English)
- `QUICK_DEPLOY.md` - Quick checklist (English)
- `nginx-configs/` - Nginx configuration files
  - `kss.org.conf` - Main site config
  - `admin.kss.org.conf` - Admin panel config
  - `api.kss.org.conf` - API config (optional)
- `env-examples/` - Environment variable examples
  - `backend.env.example` - Backend .env example
  - `frontend.env.example` - Frontend .env example
  - `mainsite.env.example` - Mainsite .env example
- `deploy.sh` - Automated deployment script
- `pm2-ecosystem.config.js` - PM2 configuration

## 🔧 મુખ્ય Commands

### Backend Start/Stop
```bash
pm2 start kss-backend
pm2 stop kss-backend
pm2 restart kss-backend
pm2 logs kss-backend
```

### Nginx
```bash
sudo nginx -t              # Test configuration
sudo systemctl reload nginx  # Reload
sudo systemctl restart nginx # Restart
```

### MongoDB
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
```

### Update કરવા માટે
```bash
cd /var/www/kss
./deploy.sh
```

## ⚙️ Environment Variables

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong secret key (minimum 32 characters)
- `CORS_ORIGIN` - https://admin.kss.org
- `PORT` - 3000

### Frontend (.env.production)
- `VITE_API_URL` - https://api.kss.org/api (or https://kss.org/api)

### Mainsite (.env.production)
- `VITE_API_URL` - https://api.kss.org/api (or https://kss.org/api)

## ✅ Verification

Deployment પછી check કરો:
- ✅ https://kss.org - Main site load થાય છે?
- ✅ https://admin.kss.org - Admin panel load થાય છે?
- ✅ https://api.kss.org/api/health - API working છે?
- ✅ Admin panel માં login થઈ શકે છે?

## 🆘 Common Issues

**502 Bad Gateway:**
- Backend running છે? `pm2 list` check કરો
- Backend logs: `pm2 logs kss-backend`

**SSL Error:**
- `sudo certbot certificates` run કરો
- `sudo certbot renew` run કરો

**MongoDB Connection Error:**
- MongoDB running છે? `sudo systemctl status mongod`
- `.env` માં `MONGODB_URI` correct છે?

## 📝 Notes

- `.env` files ક્યારેય Git માં commit ન કરો
- Regular backups setup કરો
- System updates: `sudo apt update && sudo apt upgrade`
- Monitor logs regularly

## 📚 Detailed Guide

Complete detailed guide માટે `DEPLOYMENT_GUIDE.md` file read કરો (English માં).

---

**Created:** January 2026
**Version:** 1.0
