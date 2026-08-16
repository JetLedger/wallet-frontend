#!/usr/bin/env bash
set -euo pipefail

WALLET_CORE_DIR="${WALLET_CORE_DIR:-../wallet-core}"
API_BASE="http://localhost:8080/api/v1"
PROBE_URL="${API_BASE}/wallets/00000000-0000-0000-0000-000000000000"

if curl -s -o /dev/null --max-time 2 "${PROBE_URL}"; then
  echo "wallet-core already running on :8080"
  npx playwright test "$@"
  exit 0
fi

if [ ! -d "${WALLET_CORE_DIR}" ]; then
  echo "ERROR: wallet-core not found at '${WALLET_CORE_DIR}' (set WALLET_CORE_DIR)." >&2
  exit 1
fi

echo "Starting wallet-core (dev profile)…"
(cd "${WALLET_CORE_DIR}" && ./gradlew bootRun --args='--spring.profiles.active=dev' > /tmp/wallet-core-e2e.log 2>&1) &
BACKEND_PID=$!

killtree() {
  local pid=$1
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    killtree "$child"
  done
  kill "$pid" 2>/dev/null || true
}
trap 'killtree "$BACKEND_PID"' EXIT

ready=0
for _ in $(seq 1 120); do
  if curl -s -o /dev/null --max-time 2 "${PROBE_URL}"; then
    ready=1
    break
  fi
  sleep 1
done

if [ "${ready}" -ne 1 ]; then
  echo "ERROR: wallet-core did not become ready on :8080. See /tmp/wallet-core-e2e.log" >&2
  exit 1
fi

echo "wallet-core ready; running Playwright…"
npx playwright test "$@"