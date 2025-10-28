#!/usr/bin/env bash
# NOTE: run this script with bash: `bash ./test/smoke.sh` (arrays/expansions differ in sh)
set -euo pipefail

# Base URLs (backend required; keycloak optional)
# Optional auth:
#   SMOKE_TOKEN: Bearer token to call /probability (e.g., from Keycloak)
# Strict mode:
#   STRICT=1 to fail if /probability is not 2xx
API_BASE="${API:-http://localhost:${BACKEND_PORT:-8080}}"
KEYCLOAK_BASE="${KEYCLOAK_BASE:-}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-master}"

has_jq() { command -v jq >/dev/null 2>&1; }
pp_json() {
  if has_jq; then jq .; else cat; fi
}

echo "[SMOKE] Using API_BASE=$API_BASE"
if [ -n "$KEYCLOAK_BASE" ]; then
  echo "[SMOKE] Using KEYCLOAK_BASE=$KEYCLOAK_BASE (realm: $KEYCLOAK_REALM)"
fi

echo "[SMOKE] Waiting for backend /health..."
for i in {1..60}; do
  if curl -fsS --max-time 2 "$API_BASE/health" >/dev/null; then
    break
  fi
  sleep 2
  if [ "$i" -eq 60 ]; then
    echo "[SMOKE][ERROR] Backend did not become healthy in time"
    exit 1
  fi
done

echo "[SMOKE] GET /health"
curl -fsS "$API_BASE/health" | pp_json

echo "[SMOKE] GET /status"
curl -fsS "$API_BASE/status" | pp_json

echo "[SMOKE] POST /probability (sample payload)"

# capture response body and status without exiting on non-2xx
set +e
RESP_FILE="$(mktemp)"

if [ -n "${SMOKE_TOKEN:-}" ]; then
  echo "[SMOKE] Using bearer token from SMOKE_TOKEN"
  HTTP_CODE=$(curl -sS -o "$RESP_FILE" -w "%{http_code}" -X POST "$API_BASE/probability" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $SMOKE_TOKEN" \
    -d '{"lat":-34.9,"lon":-56.2,"date":"2025-10-20","type":"rain"}')
else
  HTTP_CODE=$(curl -sS -o "$RESP_FILE" -w "%{http_code}" -X POST "$API_BASE/probability" \
    -H 'Content-Type: application/json' \
    -d '{"lat":-34.9,"lon":-56.2,"date":"2025-10-20","type":"rain"}')
fi
CURL_EXIT=$?
set -e

if [ "$CURL_EXIT" -ne 0 ]; then
  echo "[SMOKE][ERROR] curl to /probability failed (exit $CURL_EXIT)"
  cat "$RESP_FILE" || true
  rm -f "$RESP_FILE"
  exit 1
fi

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  if command -v jq >/dev/null 2>&1; then jq . < "$RESP_FILE"; else cat "$RESP_FILE"; fi
else
  echo "[SMOKE][WARN] /probability returned HTTP $HTTP_CODE (maybe auth required)."
  if command -v jq >/dev/null 2>&1; then jq . < "$RESP_FILE"; else cat "$RESP_FILE"; fi
  if [ "${STRICT:-0}" = "1" ]; then
    echo "[SMOKE][FAIL] STRICT=1 set; failing on non-2xx from /probability"
    rm -f "$RESP_FILE"
    exit 1
  fi
fi
rm -f "$RESP_FILE"

# Optional: Keycloak availability check (only if KEYCLOAK_BASE is provided)
if [ -n "$KEYCLOAK_BASE" ]; then
  echo "[SMOKE] Keycloak well-known openid-configuration"
  KC_WK="$KEYCLOAK_BASE/realms/$KEYCLOAK_REALM/.well-known/openid-configuration"
  curl -fsS "$KC_WK" | pp_json
fi

echo "[SMOKE] OK ✅"