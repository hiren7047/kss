# Nginx Configuration Files

Use these configs **as-is** by copying from the repo. Do **not** create files manually with `nano`.

**App root:** `/var/www/kss/kss` (git clone creates a `kss` subfolder).

## 1. Copy configs (run from VPS)

```bash
# App lives at /var/www/kss/kss after: git clone ... /var/www/kss
sudo cp /var/www/kss/kss/nginx-configs/kss.org.conf /etc/nginx/sites-available/kss.org
sudo cp /var/www/kss/kss/nginx-configs/admin.kss.org.conf /etc/nginx/sites-available/admin.kss.org
sudo cp /var/www/kss/kss/nginx-configs/api.kss.org.conf /etc/nginx/sites-available/api.kss.org
```

## 2. Remove default site & broken symlinks

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/kss.org
sudo rm -f /etc/nginx/sites-enabled/admin.kss.org
sudo rm -f /etc/nginx/sites-enabled/api.kss.org
```

## 3. Enable KSS sites

```bash
sudo ln -s /etc/nginx/sites-available/kss.org /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.kss.org /etc/nginx/sites-enabled/
# Optional: sudo ln -s /etc/nginx/sites-available/api.kss.org /etc/nginx/sites-enabled/
```

## 4. Test and reload

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 5. SSL (after sites work on HTTP)

```bash
sudo certbot --nginx -d kss.org -d www.kss.org
sudo certbot --nginx -d admin.kss.org
# Optional: sudo certbot --nginx -d api.kss.org
```

Configs are **HTTP-only** initially. Certbot will add HTTPS.
