#!/usr/bin/env bash
# Post-deploy smoke tests. Exits non-zero if any check fails.
# Usage: ./scripts/smoke-test.sh [base_url]
# Example: ./scripts/smoke-test.sh https://airona.com
set -euo pipefail

BASE_URL="${1:-https://airona.com}"
FAILURES=0

log()  { echo "[SMOKE] $*"; }
pass() { echo "[PASS]  $*"; }
fail() { echo "[FAIL]  $*"; FAILURES=$((FAILURES + 1)); }

check_http() {
    local label="$1"
    local url="$2"
    local expected_status="${3:-200}"
    local expected_body="${4:-}"

    response=$(curl -sS -o /tmp/smoke_body -w "%{http_code}" \
        --max-time 15 \
        --retry 2 \
        --retry-delay 3 \
        -H "User-Agent: AironaSmokeTest/1.0" \
        "${url}" 2>/dev/null)

    if [ "${response}" != "${expected_status}" ]; then
        fail "${label}: expected HTTP ${expected_status}, got ${response} (${url})"
        return
    fi

    if [ -n "${expected_body}" ]; then
        if ! grep -q "${expected_body}" /tmp/smoke_body 2>/dev/null; then
            fail "${label}: response body did not contain '${expected_body}'"
            return
        fi
    fi

    pass "${label} (HTTP ${response})"
}

log "Running smoke tests against: ${BASE_URL}"
log "──────────────────────────────────────────"

# Laravel health endpoint
check_http "Laravel health" "${BASE_URL}/up" "200"

# Public API — products list
check_http "Products API" "${BASE_URL}/api/v1/products" "200" '"data"'

# Public frontend pages (SSG HTML should contain og:title)
check_http "Homepage (es)" "${BASE_URL}/es/" "200" "Airona"
check_http "Homepage redirect" "${BASE_URL}/" "301"

# Experiences pages
check_http "Shared flight (es)" "${BASE_URL}/es/vuelo-compartido/" "200"
check_http "Private flight (es)" "${BASE_URL}/es/vuelo-privado/" "200"

# SEO-critical checks
check_http "Sitemap index" "${BASE_URL}/sitemap-index.xml" "200" "sitemap"
check_http "Robots.txt" "${BASE_URL}/robots.txt" "200" "Disallow: /admin"

# Admin panel loads (SPA shell — not checking auth)
check_http "Admin panel" "${BASE_URL}/admin/login" "200"

# Checkout session endpoint exists (should 422 without body, not 404/500)
CHECKOUT_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" \
    --max-time 10 \
    -X POST "${BASE_URL}/api/v1/checkout/sessions" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null)
if [ "${CHECKOUT_STATUS}" = "422" ] || [ "${CHECKOUT_STATUS}" = "401" ]; then
    pass "Checkout endpoint reachable (HTTP ${CHECKOUT_STATUS})"
else
    fail "Checkout endpoint: unexpected HTTP ${CHECKOUT_STATUS}"
fi

# CSRF cookie endpoint (Sanctum)
check_http "Sanctum CSRF cookie" "${BASE_URL}/sanctum/csrf-cookie" "204"

log "──────────────────────────────────────────"

if [ "${FAILURES}" -gt 0 ]; then
    log "FAILED: ${FAILURES} smoke test(s) failed."
    exit 1
else
    log "All smoke tests passed."
fi
