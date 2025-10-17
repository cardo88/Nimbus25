#!/usr/bin/env bash
set -euo pipefail

API="http://localhost:${BACKEND_PORT:-8080}"
WEB="http://localhost:${FRONTEND_PORT:-8081}"

echo "[SMOKE] Esperando backend /health..."
for i in {1..60}; do
  if curl -fsS "$API/health" >/dev/null; then break; fi
  sleep 2
done
curl -fsS "$API/health" | jq .

echo "[SMOKE] /status"
curl -fsS "$API/status" | jq .

echo "[SMOKE] Frontend responde index"
curl -fsS "$WEB" >/dev/null && echo "OK frontend"