# Nginx Configuration Files

Use these configs **as-is** by copying from the repo. Do **not** create files manually with `nano`.

**App root:** `/var/www/kss/kss` (git clone creates a `kss` subfolder).

## Which URL serves what

| URL | Serves |
|-----|--------|
| **krushnasadasahayte.org** / **www.krushnasadasahayte.org** | **Mainsite** (public website) — `mainsite/dist` |
| **admin.krushnasadasahayte.org** | **Admin panel** (login/dashboard) — `frontend/dist` |
| **api.krushnasadasahayte.org** | **API** (backend proxy to port 3000) |

The **main site** config is `default_server`: IP access (e.g. 82.112.234.87) and any unknown Host get the mainsite, not the admin.

## 1. Copy configs (run from VPS)

```bash
# App lives at /var/www/kss/kss after: git clone ... /var/www/kss
sudo cp /var/www/kss/kss/nginx-configs/krushnasadasahayte.org.conf /etc/nginx/sites-available/krushnasadasahayte.org
sudo cp /var/www/kss/kss/nginx-configs/admin.krushnasadasahayte.org.conf /etc/nginx/sites-available/admin.krushnasadasahayte.org
sudo cp /var/www/kss/kss/nginx-configs/api.krushnasadasahayte.org.conf /etc/nginx/sites-available/api.krushnasadasahayte.org
```

## 2. Remove default site & broken symlinks

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/krushnasadasahayte.org
sudo rm -f /etc/nginx/sites-enabled/admin.krushnasadasahayte.org
sudo rm -f /etc/nginx/sites-enabled/api.krushnasadasahayte.org
```

## 3. Enable KSS sites

```bash
sudo ln -s /etc/nginx/sites-available/krushnasadasahayte.org /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.krushnasadasahayte.org /etc/nginx/sites-enabled/
# Optional: sudo ln -s /etc/nginx/sites-available/api.krushnasadasahayte.org /etc/nginx/sites-enabled/
```

## 4. Test and reload

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 5. SSL (after sites work on HTTP)

```bash
sudo certbot --nginx -d krushnasadasahayte.org -d www.krushnasadasahayte.org
sudo certbot --nginx -d admin.krushnasadasahayte.org
# Optional: sudo certbot --nginx -d api.krushnasadasahayte.org
```

Configs are **HTTP-only** initially. Certbot will add HTTPS.
