#!/usr/bin/env bash
# Local development only. Never links to or reads customer data from hosted Supabase.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
root="$(pwd -P)"
source_sha=13bf2af385ebbe68a78c652daf5cffa3db95df24
legacy="${IPIX_LEGACY_SOURCE:-/home/sk/ipixai}"
network=ipixopen1505-loopback
[[ "$(supabase --version 2>/dev/null)" == 3.2.0 ]] || { echo "Use Supabase CLI 3.2.0"; exit 1; }
[[ ! -e supabase/.temp/project-ref && ! -e supabase/.branches/_current_branch ]] || { echo "Refusing linked or ambiguous project"; exit 1; }
grep -qx 'project_id = "ipixopen1505"' supabase/config.toml || exit 1
if [[ -d supabase/migrations ]]; then
  # Never replace an existing snapshot silently.
  [[ "$(find supabase/migrations -maxdepth 1 -name '*.sql' | wc -l)" -eq 350 ]] || { echo "Unexpected migration count; inspect existing snapshot"; exit 1; }
  diff -q <(git -C "$legacy" ls-tree -r "$source_sha" supabase/migrations | awk '{print $3, $4}') <(find supabase/migrations -maxdepth 1 -name '*.sql' | sort | while read -r file; do printf '%s %s\n' "$(git hash-object "$file")" "$file"; done) || { echo "Migration snapshot differs from pinned source"; exit 1; }
else
  git -C "$legacy" archive "$source_sha" supabase/migrations | tar -x
fi
if docker inspect supabase_db_ipixopen1505 >/dev/null 2>&1; then
  [[ "$(docker inspect supabase_db_ipixopen1505 --format '{{index .Config.Labels "com.supabase.cli.workdir"}}')" == "$root" ]] || { echo "Local project already belongs to another worktree"; exit 1; }
fi
if ! docker network inspect "$network" >/dev/null 2>&1; then
  docker network create -o com.docker.network.bridge.host_binding_ipv4=127.0.0.1 "$network" >/dev/null
fi
[[ "$(docker network inspect "$network" --format '{{index .Options "com.docker.network.bridge.host_binding_ipv4"}}')" == 127.0.0.1 ]] || { echo "Unsafe network binding"; exit 1; }
# Keep only DB, Auth, REST and gateway initially. Add services when a feature needs them.
mkdir -p .logs
(umask 077; supabase --workdir "$root" start --network-id "$network" -x realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor > .logs/ipixopen1505-start.log 2>&1) || { echo "Local startup failed; inspect .logs/ipixopen1505-start.log locally"; exit 1; }
echo "Local database started (API 127.0.0.1:56221, DB 127.0.0.1:56222)."
