#!/usr/bin/env bash
# Build and inspect the actual image, without starting the API or requiring secrets.
set -euo pipefail
cd "$(dirname "$0")/.."
image=ipix-railway-check:local
# The hosted pin must be reviewed when the checkout upgrades its backend.
expected_tag="$(sed -n 's/^OPENBOT_BACKEND_TAG=//p' backend-images.env)"
test -n "$expected_tag"
test "$(sed -n 's/^# OpenBot \(v[^,]*\),.*/\1/p' Dockerfile.railway)" = "$expected_tag"
docker build --file Dockerfile.railway --tag "$image" .
test "$(docker image inspect "$image" --format '{{json .Config.Entrypoint}}')" = '["/init"]'
docker run --rm --network none --user apiuser --entrypoint /bin/sh "$image" -ec '
    test -x /app/bin/openbot
    test "$TENANT_PACKAGE_DIR" = /app/config/ipix
    test "$PORT" = 3001
    test "$SERVER_PORT" = 3001
    test -s /app/app/dist/index.html
    if grep -q __OPENBOT_WS_PORT__ /app/app/dist/index.html; then
        echo "Dev-only socket port in production HTML" >&2
        exit 1
    fi
    grep -q iPix /app/app/dist/assets/application-config-*.js
    for name in brand agents channels model knowledge; do
        path="/app/config/ipix/$name.yaml"
        test -s "$path"
        test -r "$path"
        test ! -w "$path"
    done
    grep -q "name: Production Assistant" /app/config/ipix/agents.yaml
    grep -q "name: Brand Knowledge" /app/config/ipix/agents.yaml
    test ! -e /src
    test ! -e /app/.env
    test ! -e /app/config/ipix/.env
    echo "PASS: native runtime, production frontend, read-only fashion configuration"
'
