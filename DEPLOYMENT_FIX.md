# Fix Current Deployment Issues

Use these steps on your VPS to fix the problems you hit.

---

## 1. App location (git clone creates `kss/` subfolder)

Your repo is at `/var/www/kss/kss/`. Backend, frontend, mainsite are inside `kss`:

```
/var/www/kss/
└── kss/
    ├── backend/
    ├── frontend/
    ├── mainsite/
    ├── nginx-configs/
    └── ...
```

All commands below use `/var/www/kss/kss` as the app root.

---

## 2. Backend `package.json` missing (was in .gitignore)

`.gitignore` used to ignore `backend/package.json`, so it was never committed. That’s now fixed locally.

**On your VPS**, either:

**Option A – Pull latest and use repo’s backend**

```bash
cd /var/www/kss/kss
git pull origin main
```

Then ensure `backend/package.json` exists. If it’s still missing (e.g. not pushed yet), use Option B.

**Option B – Create `package.json` on the server**

```bash
cd /var/www/kss/kss/backend
nano package.json
```

Paste this (save and exit: Ctrl+O, Enter, Ctrl+X):

```json
{
  "name": "kss-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "seed:admin": "node src/scripts/seedAdmin.js",
    "seed:cms": "node src/scripts/seedCMSData.js",
    "seed:transparency": "node src/scripts/seedTransparencyData.js",
    "seed:events": "node src/scripts/seedEventsData.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "canvas": "^3.2.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "joi": "^17.11.0",
    "jsbarcode": "^3.12.3",
    "jsonwebtoken": "^9.0.2",
    "moment": "^2.30.1",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pdfkit": "^0.14.0",
    "razorpay": "^2.9.6"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.2"
  }
}
```

---

## 3. Nginx: copy configs from repo, fix symlinks

Don’t use `nano` to create configs. Use the ones in the repo.

**3.1 Copy configs**

```bash
sudo cp /var/www/kss/kss/nginx-configs/krushnasadasahayte.org.conf /etc/nginx/sites-available/krushnasadasahayte.org
sudo cp /var/www/kss/kss/nginx-configs/admin.krushnasadasahayte.org.conf /etc/nginx/sites-available/admin.krushnasadasahayte.org
sudo cp /var/www/kss/kss/nginx-configs/api.krushnasadasahayte.org.conf /etc/nginx/sites-available/api.krushnasadasahayte.org
```

**3.2 Remove default site and old symlinks**

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/krushnasadasahayte.org
sudo rm -f /etc/nginx/sites-enabled/admin.krushnasadasahayte.org
sudo rm -f /etc/nginx/sites-enabled/api.krushnasadasahayte.org
```

**3.3 Re-create symlinks**

```bash
sudo ln -s /etc/nginx/sites-available/krushnasadasahayte.org /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.krushnasadasahayte.org /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.krushnasadasahayte.org /etc/nginx/sites-enabled/
```

**3.4 Test and reload**

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4. Install deps, build, backend .env

**4.1 Backend**

```bash
cd /var/www/kss/kss/backend
mkdir -p logs
npm install
```

Create `.env`:

```bash
cp /var/www/kss/kss/env-examples/backend.env.example .env
nano .env
```

Set at least:

- `NODE_ENV=production`
- `PORT=3000`
- `MONGODB_URI=mongodb://localhost:27017/kss_ngo`
- `JWT_SECRET=<generate with: openssl rand -base64 32>`
- `CORS_ORIGIN=https://admin.krushnasadasahayte.org`

**4.2 Frontend**

```bash
cd /var/www/kss/kss/frontend
npm install
```

Create production env:

```bash
cp /var/www/kss/kss/env-examples/frontend.env.example .env.production
nano .env.production
```

Set `VITE_API_URL` to your API URL, e.g.:

- `https://api.krushnasadasahayte.org/api` if using api.krushnasadasahayte.org, or  
- `https://krushnasadasahayte.org/api` if you proxy API under krushnasadasahayte.org.

Then build:

```bash
npm run build
```

**4.3 Mainsite**

```bash
cd /var/www/kss/kss/mainsite
npm install
cp /var/www/kss/kss/env-examples/mainsite.env.example .env.production
nano .env.production
```

Set `VITE_API_URL` same as frontend, then:

```bash
npm run build
```

---

## 5. Start backend with PM2

```bash
cd /var/www/kss/kss/backend
pm2 start src/server.js --name kss-backend
pm2 save
pm2 startup
```

Check:

```bash
pm2 list
pm2 logs kss-backend
```

---

## 6. SSL (after HTTP works)

```bash
sudo certbot --nginx -d krushnasadasahayte.org -d www.krushnasadasahayte.org
sudo certbot --nginx -d admin.krushnasadasahayte.org
sudo certbot --nginx -d api.krushnasadasahayte.org
```

---

## 7. Seed admin user

```bash
cd /var/www/kss/kss/backend
npm run seed:admin
```

---

## Quick checklist

- [ ] App root is `/var/www/kss/kss`
- [ ] `backend/package.json` present (from git or Option B above)
- [ ] Nginx configs **copied** from `nginx-configs/`, not created with nano
- [ ] Default site removed, symlinks recreated, `nginx -t` OK
- [ ] Backend `.env` created and filled
- [ ] Frontend/mainsite `.env.production` and `npm run build` done
- [ ] Backend running with PM2
- [ ] Certbot run for SSL
- [ ] `npm run seed:admin` executed

After this, `https://krushnasadasahayte.org`, `https://admin.krushnasadasahayte.org`, and `https://api.krushnasadasahayte.org` should work.
