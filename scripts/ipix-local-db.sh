#!/usr/bin/env bash
# Local development only. Never links to or reads customer data from hosted Supabase.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
root="$(pwd -P)"
source_sha=13bf2af385ebbe68a78c652daf5cffa3db95df24
legacy="${IPIX_LEGACY_SOURCE:-/home/sk/ipixai}"
network=ipixopen1505-loopback
[[ "$(supabase --version 2>/dev/null)" == 3.2.0 ]] || { echo "Use Supabase CLI 3.2.0"; exit 1; }
[[ ! -e supabase/.temp/project-ref ]] || { echo "Refusing linked project"; exit 1; }
# Supabase CLI writes a local "main" marker even for an unlinked project.
if [[ -e supabase/.branches/_current_branch ]]; then
  [[ "$(cat supabase/.branches/_current_branch)" == main ]] || { echo "Refusing ambiguous local branch"; exit 1; }
fi
grep -qx 'project_id = "ipixopen1505"' supabase/config.toml || exit 1
if [[ ! -d supabase/migrations ]]; then
  git -C "$legacy" archive "$source_sha" supabase/migrations | tar -x
fi
# Compare even a newly exported snapshot; both commands must succeed.
[[ "$(find supabase/migrations -maxdepth 1 -name '*.sql' | wc -l)" -eq 350 ]] || { echo "Unexpected migration count; inspect existing snapshot"; exit 1; }
expected="$(git -C "$legacy" ls-tree -r "$source_sha" supabase/migrations | awk '{print $3, $4}')"
actual="$(find supabase/migrations -maxdepth 1 -name '*.sql' | LC_ALL=C sort | while read -r file; do hash="$(git hash-object "$file")" || exit 1; printf '%s %s\n' "$hash" "$file"; done)"
[[ "$expected" == "$actual" ]] || { echo "Migration snapshot differs from pinned source"; exit 1; }
# Inspect actual containers, not just the network's default binding.
# Refuse unexpected project services and foreign workdirs without stopping anything.
verify_stack() {
  local required="$1" names name service actual_ports expected_ports
  names="$(docker ps -a --filter label=com.supabase.cli.project=ipixopen1505 --format '{{.Names}}')"
  for name in $names; do
    case "$name" in
      supabase_db_ipixopen1505|supabase_kong_ipixopen1505|supabase_auth_ipixopen1505|supabase_rest_ipixopen1505) ;;
      *) echo "Unexpected local service: $name"; return 1 ;;
    esac
  done
  for service in db kong auth rest; do
    name="supabase_${service}_ipixopen1505"
    if ! docker container inspect "$name" >/dev/null 2>&1; then
      [[ "$required" == no ]] || { echo "Missing required service: $name"; return 1; }
      continue
    fi
    [[ "$(docker container inspect "$name" --format '{{index .Config.Labels "com.supabase.cli.project"}}')" == ipixopen1505 ]] || { echo "Wrong project: $name"; return 1; }
    [[ "$(docker container inspect "$name" --format '{{index .Config.Labels "com.supabase.cli.workdir"}}')" == "$root" ]] || { echo "Wrong worktree: $name"; return 1; }
    [[ "$(docker container inspect "$name" --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}')" == "$network" ]] || { echo "Unsafe container network: $name"; return 1; }
    [[ "$(docker container inspect "$name" --format '{{.State.Running}}')" == true ]] || { echo "Service not running: $name"; return 1; }
    actual_ports="$(docker container inspect "$name" --format '{{range $port, $bindings := .NetworkSettings.Ports}}{{range $bindings}}{{printf "%s %s %s\n" $port .HostIp .HostPort}}{{end}}{{end}}')"
    case "$service" in
      db) expected_ports="5432/tcp 127.0.0.1 56222" ;;
      kong) expected_ports="8000/tcp 127.0.0.1 56221" ;;
      *) expected_ports="" ;;
    esac
    [[ "$actual_ports" == "$expected_ports" ]] || { echo "Unsafe or unexpected published ports: $name"; return 1; }
  done
}
verify_stack no
if ! docker network inspect "$network" >/dev/null 2>&1; then
  docker network create -o com.docker.network.bridge.host_binding_ipv4=127.0.0.1 "$network" >/dev/null
fi
[[ "$(docker network inspect "$network" --format '{{index .Options "com.docker.network.bridge.host_binding_ipv4"}}')" == 127.0.0.1 ]] || { echo "Unsafe network binding"; exit 1; }
# Keep only DB, Auth, REST and gateway initially. Add services when a feature needs them.
mkdir -p .logs
(umask 077; supabase --workdir "$root" start --network-id "$network" -x realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor > .logs/ipixopen1505-start.log 2>&1) || { echo "Local startup failed; inspect .logs/ipixopen1505-start.log locally"; exit 1; }
verify_stack yes
echo "Local database started (API 127.0.0.1:56221, DB 127.0.0.1:56222)."
