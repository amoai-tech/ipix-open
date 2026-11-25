# Local Supabase for iPix Open (IPI-1505)

Use the free local development stack rather than a hosted branch. This is a temporary schema snapshot for development only; IPI-1506 owns the reviewed migration handoff. The existing production migration executor stays unchanged.

## Start

Prerequisites: Docker, Supabase CLI 3.2.0, and a local clone of ipixai containing the pinned migration commit. From the IPI-1505 worktree:

```bash
./scripts/ipix-local-db.sh
```

Set IPIX_LEGACY_SOURCE to the local source checkout if necessary. The helper exports only the 350 tracked migration files from the pinned commit, checks their integrity on reuse, refuses a linked project or another worktree's stack, and starts only PostgreSQL, Auth, REST and Kong. No hosted credentials, data exports, production writes or paid resources. Local migrations are ignored temporarily pending IPI-1506; remove that ignore during the canonical handoff. Do not copy legacy environment files.

API: http://127.0.0.1:56221; PostgreSQL: 127.0.0.1:56222. The dedicated Docker network binds published ports to loopback. Never expose the local stack publicly.

## Evidence (2026-11-25)

- Source: legacy commit 13bf2af385ebbe68a78c652daf5cffa3db95df24, 350 exact migration blobs.
- All 350 versions applied to the local database; 85/85 public regular tables have RLS enabled.
- Database and Auth containers healthy; Auth health endpoint HTTP 200.
- Both published ports bound to 127.0.0.1; existing stacks left untouched.
- Real synthetic customer sign-in and own/foreign data access are not yet verified. Do not interpret an RLS-enabled flag as proof of correct tenant policies.

## Next

Reuse the two existing synthetic owner identities and fixture logic in legacy scripts/run-approval-001-e2e.mjs and e2e/support/approval-001-fixtures.ts; scope fixture creation strictly to this stack. Prove real Auth sessions, own-brand read, foreign-brand denial, and idempotent repeat. Keep comprehensive QA and actual OpenBot integration in their assigned tasks. No customer data until IPI-1504/1492 pass.

Reference — ADAPT: https://supabase.com/docs/guides/local-development and https://supabase.com/docs/guides/local-development/cli-workflows — local CLI, separate project and loopback binding; no hosted branch or schema pull. Legacy snapshot: https://github.com/amoai-tech/ipixai/tree/13bf2af385ebbe68a78c652daf5cffa3db95df24/supabase/migrations — exact migrations for local development only.
