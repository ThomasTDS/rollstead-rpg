#!/usr/bin/env bash
# Checks that the published site answers and serves the Rollstead page.
# Usage: ./scripts/smoke-test.sh <url>
# Temporary check until the Playwright smoke test arrives with NT-06.

set -euo pipefail

url="${1:?Usage: $0 <url>}"
attempts=10
delay=15

for attempt in $(seq 1 "$attempts"); do
  echo "Attempt ${attempt}/${attempts}: GET ${url}"
  status=$(curl --silent --output /tmp/smoke-body.html --write-out '%{http_code}' --max-time 20 "$url" || true)

  if [[ "$status" == "200" ]] && grep -q '<title>Rollstead</title>' /tmp/smoke-body.html; then
    echo "OK: ${url} answered 200 with the Rollstead page."
    exit 0
  fi

  echo "Not ready yet (HTTP ${status})."
  sleep "$delay"
done

echo "FAIL: ${url} did not serve the Rollstead page after ${attempts} attempts." >&2
exit 1
