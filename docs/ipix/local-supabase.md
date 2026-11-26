# Local Supabase for iPix Open (IPI-1505)

Use the free local development stack rather than a hosted branch. This is a temporary schema snapshot for development only; IPI-1506 owns the reviewed migration handoff. The existing production migration executor stays unchanged.

## Start

Prerequisites: Docker, Supabase CLI 3.2.0, and a local clone of ipixai containing the pinned migration commit. From the IPI-1505 worktree:

```bash
./scripts/ipix-local-db.sh
```

Set IPIX_LEGACY_SOURCE to the local source checkout if necessary. The helper exports only the 350 tracked migration files from the pinned commit, checks their integrity on reuse, refuses a linked project or another worktree's stack, and starts only PostgreSQL, Auth, REST and Kong. No hosted credentials, data exports, production writes or paid resources. Local migrations are ignored temporarily pending IPI-1506; remove that ignore during the canonical handoff. Do not copy legacy environment files.

API: http://127.0.0.1:56221; PostgreSQL: 127.0.0.1:56222. The dedicated Docker network binds published ports to loopback. Always use the guarded helper, not plain `supabase start`: disabling optional services does not bind the required DB and gateway ports on a default network. The helper verifies container ownership, network, running state and exact published ports both before reuse and after startup. It refuses unexpected services or ports without stopping another stack. Studio, Realtime, local SMTP, Storage (including S3/vector), Edge Runtime and Analytics are disabled in config as defense in depth. Enable them only for a separately reviewed feature.

## Evidence (2026-11-25)

- Source: legacy commit 13bf2af385ebbe68a78c652daf5cffa3db95df24, 350 exact migration blobs.
- All 350 versions applied to the local database; 85/85 public regular tables have RLS enabled.
- Database and Auth containers healthy; Auth health endpoint HTTP 200.
- Both published ports bound to 127.0.0.1; existing stacks left untouched.
- Two synthetic customers signed up via ordinary local Auth and signed in with passwords. Both verified their profile, one distinct owner membership and own brand; cross-tenant brand and anonymous reads were denied. The proof passed twice. OpenBot identity forwarding remains a separate IPI-1504/1492 gate.

## Review hardening (2026-11-26)

- Snapshot integrity uses byte-order sorting and verifies both fresh exports and existing snapshots.
- Signup fallback is limited to invalid credentials for an absent synthetic account. An existing account with invalid credentials, a rate limit, or a server error stops with the original HTTP status and sanitized error code.
- Both users see only their own organization, membership and brand in unfiltered REST reads; explicit foreign IDs return empty arrays. Anonymous reads of all three tables return empty arrays or expected 401/403; transport/5xx failures cannot pass.
- Restarted the verified local stack while retaining its volume. Exactly four required containers started, only DB/API published on loopback; Auth HTTP 200; two consecutive expanded proof runs passed. Migration count 350, RLS count 85/85. The two retained synthetic users, organizations, memberships and brands each number exactly two (other migration-owned organizations are not fixture rows).
- Simulated HTTP 400 for an existing account, 429 and 503 rejected without attempting signup. Simulated unsafe existing Docker binding was rejected before startup; no real unsafe port was opened.
- A fresh empty-volume replay after this configuration change and deterministic fixture deletion/cleanup were not performed. Existing migration replay and retained-fixture repeatability are evidenced separately. No production writes.

Reference — REFERENCE ONLY: https://supabase.com/docs/guides/auth/debugging/error-codes — distinguish invalid credentials from rate limiting or server errors. https://supabase.com/docs/guides/database/postgres/row-level-security — verify ordinary user JWT access without privileged API credentials. https://docs.docker.com/engine/network/drivers/bridge/ — check actual host bindings, not just the network default.

## Next

Run `node scripts/ipix-local-auth-proof.mjs` after startup. It adapts the legacy synthetic owner emails and organization/brand fixtures, uses the standard local signup/sign-in API (generated user UUIDs, not manually inserted Auth rows), and provisions only those synthetic business rows. It refuses other worktrees, linked projects and non-loopback Docker bindings. Re-running is safe for these fixtures. No admin API credential is used. Keep the fixture records in this dedicated local development database. Keep comprehensive QA and actual OpenBot integration in their assigned tasks. No customer data until IPI-1504/1492 pass.

Reference — ADAPT: https://supabase.com/docs/guides/local-development and https://supabase.com/docs/guides/local-development/cli-workflows — local CLI, separate project and loopback binding; no hosted branch or schema pull. Legacy snapshot: https://github.com/amoai-tech/ipixai/tree/13bf2af385ebbe68a78c652daf5cffa3db95df24/supabase/migrations — exact migrations for local development only.
