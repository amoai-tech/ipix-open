# OpenBot v1.2.0 development foundation (IPI-1490)

This is a source integration candidate, not a production deployment. Keep the existing v1.1.2 installation and other worktrees unchanged. The upgrade retains the fashion tenant package, iPix engineering rules, standard Linux CI, and the four supported local harness images.

## Step 1 — Integrate the official source and backend together

- Destination: package.json, bun.lock, backend-images.env, release-policy.json, app/, shared/, tokens/, native clients and CI.
- COPY + ADAPT: https://github.com/CopilotKit/OpenBot/releases/tag/v1.2.0 and https://github.com/CopilotKit/OpenBot/commit/1ad2bf3a485105d1fc88729d9d60f6be62647d9f — pinned release source and its matching server image tag. Previous upstream baseline is v1.1.2 (8826a0fe3827b80c519b6b8a274e74efbaef7868).
- Preserve config/ipix, read-only Compose mount and missing-file guard, iPix AGENTS.md and PR template. Keep retired engines absent; retain remote framework identities. Adapt upstream CI component matrix and native PickError to existing iPix behavior.
- REFERENCE ONLY: https://github.com/CopilotKit/OpenBot/blob/v1.2.0/docs/upstream-upgrades.md — record the exact ancestor in .openbot-upstream.json. Conflicting changes require manual review; do not claim acceptance by the automatic clean-merge workflow.
- Verify pinned Bun 1.4.3 frozen install, focused policy/tenant/Compose tests, full typecheck/build and CI. Verify immutable release image digests and actual server version before a synthetic runtime start.

## Step 2 — Keep the fashion workspace private

- Destination: docker-compose.yml, config/ipix and isolated deployment settings; native Admin controls.
- REFERENCE ONLY: https://github.com/CopilotKit/OpenBot/blob/v1.2.0/docs/configuration.md — organization authority and memory-source defaults; https://github.com/CopilotKit/OpenBot/releases/tag/v1.2.0 — Before upgrading.
- Use one isolated customer deployment by default. The local authority has a single shared organization; never invite unrelated customers. Do not set intelligence-platform authority or own-organization mode without entitlement and isolation evidence. Do not reuse obsolete OPENBOT_MULTIPLE_ORGANIZATIONS.
- Before any customer credentials or data: keep enrollment private; review and remove automatic app grants and unnecessary actions in native Admin / Apps; disable Open apps and use its take-back option where applicable, then explicitly review remaining app/Bot permissions. The upgrade does not restore old restrictions automatically. Keep research-only tools narrow and require domain approval for writes. Verify no external search connector receives customer data without authorization.
- Keep automatic memory sources off; inspect migration behavior and turn product analytics off through supported deployment configuration where applicable. No imported production memories or customer data in QA.
- Verify two real synthetic identities and direct cross-workspace access denials for Bots, files, credentials, threads, memory and business data. Stop if any permission is broader than intended.

## Step 3 — Prove recovery before any activation

- Destination: isolated OpenBot database, native deployment and IPI-1497 release gate.
- REFERENCE ONLY: https://github.com/CopilotKit/OpenBot/blob/v1.2.0/release-policy.json — declares v1.1.2 as an upgrade source and restore-backup as recovery; rollbackCompatible is false. The release notes describe startup migrations from v1.1.3 and memory backfill; this does not prove our direct upgrade or data recovery.
- Use a new disposable synthetic instance or an isolated synthetic v1.1.2 backup with matching keys. Never point the candidate at a live database. Verify upgrade, startup, restart, real fashion coworker chat and restored backup; record exact image digests and observed migration result. Restore backup rather than just reverting the image tag.
- Production, hosting entitlement, Supabase identity forwarding, real Planner invocation and release remain separate gates. No deployment or merge without approval.

## Downstream

Coordinate the existing auth, tenant security and Planner PRs against the accepted foundation; do not overwrite or force-rebase active work. IPI-1504, IPI-1492, IPI-1493, IPI-1507, IPI-1508 and IPI-1509 retain their own acceptance gates.
