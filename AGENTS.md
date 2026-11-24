# iPix Open — Engineering Rules

This repository (`/home/sk/ipix-open/`) is the canonical new iPix application. Legacy `ipixai` is a migration source, **not** an ongoing production backend dependency. Read the current Linear issue, inspect code and installed versions, and reuse upstream OpenBot behavior before implementing custom changes.

## Permanent worktree location — mandatory

**On the iPix development workstation (user `sk`), all development worktrees must reside under `/home/sk/ipix-open-wt/`. Never create iPix Open development worktrees in `/tmp/`, `~/.worktrees/`, or the legacy iPix repository.**

On other developer machines, use the dedicated sibling `ipix-open-wt/` directory beside the canonical checkout. CI-managed checkouts are not developer worktrees and are exempt from this local path requirement.

- Main repository: `/home/sk/ipix-open/` (do not modify or reset its unrelated changes).
- Development worktrees: `/home/sk/ipix-open-wt/ipi-NNNN-short-description/`.
- Backups: `/home/sk/openbot-backups/` (never a worktree).
- Check `git worktree list --porcelain` and existing branches before creating or moving a worktree. Preserve local changes; do not delete worktrees with uncommitted work.
- If old paths are prunable, verify they are stale before `git worktree prune`. Never prune to conceal an active worktree.
- Create new worktrees from a verified current `origin/main` without modifying the main checkout.

## Application boundaries

- Canonical iPix application configuration: `config/ipix/`. Preserve `examples/` as upstream references; do not use an example directory as the production app.
- Mastra migration candidate: `agent-mastra/src/mastra/`. Reuse audited legacy agents, tools, workflows and tests, adapting code to this repo's runtime; do not duplicate Planner functionality.
- OpenBot / CopilotKit owns AI UI; Mastra owns agents/workflows; Supabase Auth + RLS and server membership checks own access; Supabase owns durable fashion data; Cloudinary owns media.
- Never treat a shared harness token, browser `orgId`, user metadata or model output as end-user authorization. Require real per-user identity and Org A/B isolation proof before customer data access.
- AI proposals require human review and server-side validation of the exact approved revision before idempotent durable writes. No autonomous publishing, payments or deletions.

## Shipping

Work in the issue-specific worktree. Follow the project's existing Bun/CI scripts, run focused tests and lint before broader checks, verify real user journeys, and retain exact-commit evidence. Do not merge PRs without explicit human approval. Stop if auth, isolation, persistence, legal entitlement, or backend deployment gates remain unproven.
