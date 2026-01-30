# DNS અને Verification Guide — krushnasadasahayte.org

Server IP: **82.112.234.87**

---

## 1. DNS માં શું Add કરવું (What to Add in DNS)

તમારા domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) માં જઈને નીચેના records add કરો.

| Type | Name/Host | Value/Points to | TTL |
|------|-----------|-----------------|-----|
| **A** | `@` | `82.112.234.87` | 3600 |
| **A** | `www` | `82.112.234.87` | 3600 |
| **A** | `admin` | `82.112.234.87` | 3600 |

**Notes:**
- `@` = root domain → **krushnasadasahayte.org**
- `www` → **www.krushnasadasahayte.org**
- `admin` → **admin.krushnasadasahayte.org**

Optional (જો API subdomain use કરો તો):
| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `api` | `82.112.234.87` | 3600 |

DNS propagate થવામાં 5–30 મિનિટ થી 24 કલાક લાગી શકે. પહેલા local test કરો.

---

## 2. DNS Check કેવી રીતે કરવું

### Your machine / browser
```bash
# Replace with your actual domain
nslookup krushnasadasahayte.org
nslookup www.krushnasadasahayte.org
nslookup admin.krushnasadasahayte.org
```
જો બધા **82.112.234.87** દેખાય તો DNS સાચું છે.

### Online
- https://dnschecker.org — Enter `krushnasadasahayte.org` and check A record globally.

---

## 3. Server પર Verification (Checklist)

SSH: `ssh root@82.112.234.87`  
App path: `/var/www/kss/kss`

### 3.1 Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
ss -tlnp | grep -E ':80|:443'
```

### 3.2 Sites enabled
```bash
ls -la /etc/nginx/sites-enabled/
```
Expected: `krushnasadasahayte.org` and `admin.krushnasadasahayte.org` (symlinks).

### 3.3 Local curl (server પર)
```bash
curl -I http://127.0.0.1
curl -I -H "Host: krushnasadasahayte.org" http://127.0.0.1
curl -I -H "Host: admin.krushnasadasahayte.org" http://127.0.0.1
```
સૌ 200 OK આવવું જોઈએ.

### 3.4 Build folders exist
```bash
ls -la /var/www/kss/kss/mainsite/dist
ls -la /var/www/kss/kss/frontend/dist
```

### 3.5 Backend (PM2)
```bash
pm2 list
pm2 logs kss-backend --lines 20
```
Backend port 3000 પર run થતો હોવો જોઈએ.

### 3.6 Firewall
```bash
sudo ufw status
```
OpenSSH, 80/tcp, 443/tcp allow હોવા જોઈએ.

---

## 4. SSL (HTTPS) — DNS પછી

DNS સાચું થયા પછી Certbot ચલાવો:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d krushnasadasahayte.org -d www.krushnasadasahayte.org
sudo certbot --nginx -d admin.krushnasadasahayte.org
```

Auto-renewal test:
```bash
sudo certbot renew --dry-run
```

---

## 5. Daily Management (Proper Manage)

### Code update
```bash
cd /var/www/kss/kss
git fetch origin
git merge origin/main   # or: git pull origin main

# Rebuild
cd frontend && npm install && npm run build
cd ../mainsite && npm install && npm run build
cd ../backend && npm install && pm2 restart kss-backend

# Nginx
sudo cp nginx-configs/krushnasadasahayte.org.conf /etc/nginx/sites-available/krushnasadasahayte.org
sudo cp nginx-configs/admin.krushnasadasahayte.org.conf /etc/nginx/sites-available/admin.krushnasadasahayte.org
sudo nginx -t && sudo systemctl reload nginx
```

### Quick status
```bash
pm2 list
sudo systemctl status nginx
sudo systemctl status mongod
```

### Logs
```bash
pm2 logs kss-backend
sudo tail -f /var/log/nginx/krushnasadasahayte.org.error.log
sudo tail -f /var/log/nginx/admin.krushnasadasahayte.org.error.log
```

---

## 6. Summary

| Step | Action |
|------|--------|
| 1 | DNS માં A records add કરો: `@`, `www`, `admin` → 82.112.234.87 |
| 2 | `nslookup` or dnschecker.org થી verify કરો |
| 3 | Server પર nginx, builds, PM2, UFW check કરો |
| 4 | DNS OK પછી Certbot થી SSL enable કરો |
| 5 | Update દરેક વખતે: git pull → build → pm2 restart → nginx reload |

---

**Direct links after DNS + SSL:**
- https://krushnasadasahayte.org — Main site  
- https://www.krushnasadasahayte.org — Main site (www)  
- https://admin.krushnasadasahayte.org — Admin panel  

---

## 7. Fix: "This site can't be reached" / ERR_CONNECTION_TIMED_OUT

જો domain open થતું નથી અને **took too long to respond** આવે તો નીચે ક્રમ પ્રમાણે check કરો.

### Step A: Direct IP થી test કરો

Browser માં આ open કરો: **http://82.112.234.87**

- **જો IP થી site open થાય:** problem ફક્ત DNS માં છે → Step B (Hostinger DNS) કરો.
- **જો IP થી પણ timeout થાય:** problem server / firewall છે → Step C અને D કરો.

---

### Step B: Hostinger DNS (ફક્ત 82.112.234.87 જ રાખો)

1. **Hostinger** → Domains → **krushnasadasahayte.org** → **DNS / Nameservers**.
2. **A records** જુઓ:
   - **@** → ફક્ત **82.112.234.87** (જો **84.32.84.32** હોય તો delete કરો).
   - **www** → **82.112.234.87**.
   - **admin** → **82.112.234.87**.
3. કોઈ પણ record જે **84.32.84.32** પર point કરે તે **delete** કરો.
4. Save કરો, 10–15 મિનિટ રાહ જુઓ, પછી ફરી **krushnasadasahayte.org** open કરો.

---

### Step C: Server પર UFW (port 80, 443 open)

SSH: `ssh root@82.112.234.87`

```bash
sudo ufw status
```

જો 80/tcp અને 443/tcp **ALLOW** નથી તો:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

---

### Step D: VPS provider નો Firewall (જરૂરી)

જો તમારો server **Hostinger VPS** અથવા **બીજા provider** (DigitalOcean, OVH, Hetzner, etc.) પર છે, તો **provider ના control panel** માં:

1. **Firewall** / **Security** / **Network** section ખોલો.
2. **Inbound** rules માં add કરો:
   - **Port 80** (HTTP) — Allow from anywhere (0.0.0.0/0).
   - **Port 443** (HTTPS) — Allow from anywhere (0.0.0.0/0).
3. Save/Apply કરો.

આ વગર બહારથી traffic server સુધી પહોંચતું નથી, એટલે connection timeout થાય છે.

---

### Step E: Quick check list (server પર)

```bash
# Nginx running?
sudo systemctl status nginx

# Listening on 80?
ss -tlnp | grep ':80'

# UFW allows 80?
sudo ufw status | grep 80
```

બધું OK હોવા પછી browser માં **http://82.112.234.87** try કરો; પછી **http://krushnasadasahayte.org** (DNS propagate પછી).

---

## 8. Fix: api.kss.org / ERR_NAME_NOT_RESOLVED (mainsite API calls)

જો mainsite (krushnasadasahayte.org) open થાય પણ impact, testimonials, events, settings load નથી થતા અને console માં **api.kss.org** અથવા **ERR_NAME_NOT_RESOLVED** આવે, તો mainsite **wrong API URL** થી build થયેલો છે. Fix:

### Step 1: Mainsite env set કરો (server પર)

```bash
cd /var/www/kss/kss/mainsite
cat .env.production
```

જો `VITE_API_URL` **api.kss.org** અથવા ખોટું હોય તો:

```bash
echo 'VITE_API_URL=https://krushnasadasahayte.org/api' > .env.production
# Or if you prefer www:
# echo 'VITE_API_URL=https://www.krushnasadasahayte.org/api' > .env.production
```

### Step 2: Mainsite ફરી build કરો

```bash
cd /var/www/kss/kss/mainsite
npm run build
```

### Step 3: Nginx માં /api proxy

**જો તમે પહેલેથી Certbot થી SSL enable કર્યું છે**, તો **whole config overwrite ન કરો** (SSL ખોવાઈ જશે). ફક્ત **location /api** block add કરો:

```bash
sudo nano /etc/nginx/sites-available/krushnasadasahayte.org
```

`server { ... }` ની અંદર, `location /uploads {` પહેલાં આ block paste કરો:

```nginx
    # API proxy (mainsite calls same-origin /api)
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
```

Save (Ctrl+O, Enter) અને exit (Ctrl+X). પછી:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**જો SSL અજણે હોય** (HTTP only), તો repo થી full config copy કરી શકો:  
`sudo cp /var/www/kss/kss/nginx-configs/krushnasadasahayte.org.conf /etc/nginx/sites-available/krushnasadasahayte.org`

### Step 4: Verify

Browser માં **https://krushnasadasahayte.org** open કરો; Network tab માં requests **https://krushnasadasahayte.org/api/...** પર જવી જોઈએ, api.kss.org પર નહીં.

---

## 9. Fix: Admin login / ERR_NAME_NOT_RESOLVED (admin panel API)

જો **admin.krushnasadasahayte.org/login** પર login કરતાં **net::ERR_NAME_NOT_RESOLVED** આવે અને login request fail થાય, તો admin frontend **wrong API URL** થી build થયેલો છે (e.g. api.kss.org). Fix:

### Step 1: Admin frontend env set કરો (server પર)

```bash
cd /var/www/kss/kss/frontend
cat .env.production
```

જો `VITE_API_URL` **api.kss.org** અથવા **api.krushnasadasahayte.org** હોય તો:

```bash
echo 'VITE_API_URL=https://admin.krushnasadasahayte.org/api' > .env.production
```

### Step 2: Admin frontend ફરી build કરો

```bash
cd /var/www/kss/kss/frontend
npm run build
```

### Step 3: Nginx માં /api proxy (admin site)

**જો Certbot થી SSL already enable છે**, whole config overwrite ન કરો. ફક્ત **location /api** block add કરો:

```bash
sudo nano /etc/nginx/sites-available/admin.krushnasadasahayte.org
```

`server { ... }` ની અંદર, `location /uploads {` પહેલાં આ block paste કરો:

```nginx
    # API proxy (admin panel calls same-origin /api)
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
```

Save અને exit. પછી:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Step 4: Verify

Browser માં **https://admin.krushnasadasahayte.org/login** open કરો; Sign in કરો. Network tab માં login request **https://admin.krushnasadasahayte.org/api/...** પર જવી જોઈએ, fail નહીં.
