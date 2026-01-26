# Nginx Configuration Files

This directory contains Nginx configuration files for the KSS deployment.

## Files

1. **kss.org.conf** - Configuration for main public website (kss.org)
2. **admin.kss.org.conf** - Configuration for admin panel (admin.kss.org)
3. **api.kss.org.conf** - Configuration for API server (api.kss.org) - Optional

## Installation

1. Copy files to Nginx sites-available:
```bash
sudo cp kss.org.conf /etc/nginx/sites-available/kss.org
sudo cp admin.kss.org.conf /etc/nginx/sites-available/admin.kss.org
sudo cp api.kss.org.conf /etc/nginx/sites-available/api.kss.org  # Optional
```

2. Enable sites:
```bash
sudo ln -s /etc/nginx/sites-available/kss.org /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.kss.org /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.kss.org /etc/nginx/sites-enabled/  # Optional
```

3. Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificates

After installing Nginx configs, obtain SSL certificates:
```bash
sudo certbot --nginx -d kss.org -d www.kss.org
sudo certbot --nginx -d admin.kss.org
sudo certbot --nginx -d api.kss.org  # If using API subdomain
```

## Important Notes

- Update SSL certificate paths after running certbot
- Ensure backend is running on port 3000
- Adjust `root` paths if your build directories are different
- Uncomment API proxy sections if not using api.kss.org subdomain

## Paths

Default paths assumed:
- Main site build: `/var/www/kss/mainsite/dist`
- Admin panel build: `/var/www/kss/frontend/dist`
- Backend API: `http://localhost:3000`

Adjust these in the config files if your setup differs.
