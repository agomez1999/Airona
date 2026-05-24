#!/usr/bin/env bash
# Airona production deploy script.
# Pulls the specified image tag, migrates, caches, and smoke-tests.
# Usage: ./scripts/deploy.sh <version-tag>
# Example: ./scripts/deploy.sh v1.2.0
set -euo pipefail

VERSION="${1:-}"
COMPOSE_FILE="docker-compose.prod.yml"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"

log()  { echo "[DEPLOY $(date -u +%H:%M:%S)] $*"; }
die()  { echo "[ERROR]  $*" >&2; exit 1; }

[ -z "${VERSION}" ] && die "Usage: $0 <version-tag>  (e.g. v1.2.0)"
[ -f "${PROJECT_DIR}/.env" ] || die ".env not found at ${PROJECT_DIR}/.env — copy .env.production.example and fill it in"

cd "${PROJECT_DIR}"

log "Deploying Airona ${VERSION}"

# Export for docker-compose variable substitution
export APP_VERSION="${VERSION}"

# Pull new images (app + queue share the same image)
log "Pulling image ${VERSION}..."
GITHUB_REPOSITORY=$(grep GITHUB_REPOSITORY .env | cut -d= -f2)
docker pull "ghcr.io/${GITHUB_REPOSITORY}/app:${VERSION}"

# Update compose to new tag
sed -i "s|image: ghcr.io/.*/app:.*|image: ghcr.io/${GITHUB_REPOSITORY}/app:${VERSION}|g" "${COMPOSE_FILE}"

# Roll services (zero-downtime: pull then replace)
log "Updating services..."
docker compose -f "${COMPOSE_FILE}" up -d --no-build app queue scheduler

# Wait for app container to be healthy
log "Waiting for app to become healthy..."
for i in $(seq 1 30); do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' \
        "$(docker compose -f "${COMPOSE_FILE}" ps -q app)" 2>/dev/null || echo "starting")
    if [ "${STATUS}" = "healthy" ]; then
        log "App is healthy."
        break
    fi
    [ "${i}" -eq 30 ] && die "App did not become healthy within 60s"
    sleep 2
done

# Run database migrations
log "Running migrations..."
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan migrate --force

# Clear stale cache (config:cache runs via entrypoint on next restart,
# but we force it here too so the running container picks up fresh caches)
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan cache:clear
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan view:clear

log "Restarting nginx to pick up any updated static assets..."
docker compose -f "${COMPOSE_FILE}" restart nginx

# Smoke tests
log "Running smoke tests..."
APP_URL=$(grep "^APP_URL=" .env | cut -d= -f2)
bash "${SCRIPT_DIR}/smoke-test.sh" "${APP_URL}"

log "Deploy ${VERSION} complete."
