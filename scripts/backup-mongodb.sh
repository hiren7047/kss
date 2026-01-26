#!/bin/bash
# MongoDB backup for KSS
# Usage: ./backup-mongodb.sh
# Crontab: 0 2 * * * /var/www/kss/kss/scripts/backup-mongodb.sh

BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
mongodump --out "$BACKUP_DIR/kss_$DATE"
# Keep only last 7 days
find "$BACKUP_DIR" -type d -name "kss_*" -mtime +7 -exec rm -rf {} + 2>/dev/null || true
