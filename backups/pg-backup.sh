#!/bin/bash
# PostgreSQL backup script for the Keycloak database
# Usage: make backup (or bash backups/pg-backup.sh)

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/keycloak_${TIMESTAMP}.sql.gz"

echo "Backing up PostgreSQL database..."
docker compose exec -T postgres pg_dump -U "${KC_DB_USERNAME:-keycloak}" "${KC_DB_NAME:-keycloak}" | gzip > "$BACKUP_FILE"

echo "Backup saved to: $BACKUP_FILE"
ls -lh "$BACKUP_FILE"
