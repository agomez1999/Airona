#!/usr/bin/env bash
# Backup PostgreSQL to Cloudflare R2 (S3-compatible).
# Designed to run as a cron job on the production host or inside a Docker container.
# Required env vars: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD,
#                    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET, AWS_ENDPOINT
set -euo pipefail

TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S")
BACKUP_FILE="airona_${TIMESTAMP}.sql.gz"
BACKUP_PATH="/tmp/${BACKUP_FILE}"

log() { echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"; }

log "Starting database backup: ${DB_DATABASE}"

PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h "${DB_HOST:-postgres}" \
    -p "${DB_PORT:-5432}" \
    -U "${DB_USERNAME}" \
    -d "${DB_DATABASE}" \
    --no-owner \
    --no-acl \
    -F p \
    | gzip -9 > "${BACKUP_PATH}"

log "Backup compressed: $(du -sh "${BACKUP_PATH}" | cut -f1)"

# Upload to R2 using AWS CLI (S3-compatible endpoint)
aws s3 cp "${BACKUP_PATH}" "s3://${AWS_BUCKET}/backups/daily/${BACKUP_FILE}" \
    --endpoint-url "${AWS_ENDPOINT}" \
    --storage-class STANDARD \
    --no-progress

log "Uploaded to R2: s3://${AWS_BUCKET}/backups/daily/${BACKUP_FILE}"

# Also write a monthly copy on the first day of the month
if [ "$(date -u +%d)" = "01" ]; then
    MONTHLY_FILE="airona_$(date -u +"%Y%m")_monthly.sql.gz"
    aws s3 cp "${BACKUP_PATH}" "s3://${AWS_BUCKET}/backups/monthly/${MONTHLY_FILE}" \
        --endpoint-url "${AWS_ENDPOINT}" \
        --no-progress
    log "Monthly copy saved: ${MONTHLY_FILE}"
fi

rm -f "${BACKUP_PATH}"

# Prune daily backups older than 30 days from R2
CUTOFF=$(date -u -d "30 days ago" +"%Y-%m-%d" 2>/dev/null || date -u -v-30d +"%Y-%m-%d")
log "Pruning daily backups older than ${CUTOFF}..."
aws s3 ls "s3://${AWS_BUCKET}/backups/daily/" \
    --endpoint-url "${AWS_ENDPOINT}" \
    | awk '{print $4}' \
    | while read -r key; do
        FILE_DATE=$(echo "${key}" | grep -oP '\d{8}' | head -1 | sed 's/\(....\)\(..\)\(..\)/\1-\2-\3/')
        if [[ "${FILE_DATE}" < "${CUTOFF}" ]]; then
            aws s3 rm "s3://${AWS_BUCKET}/backups/daily/${key}" \
                --endpoint-url "${AWS_ENDPOINT}" --quiet
            log "Deleted old backup: ${key}"
        fi
    done

log "Backup complete."
