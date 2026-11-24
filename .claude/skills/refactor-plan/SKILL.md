---
name: refactor-plan
description: "Use when planning a multi-file OpenBot/iPix refactor involving dependent callers, API compatibility, sequencing, migrations, coexistence, rollback, or implementation checkpoints."
---

# Refactor Plan — safe structural changes

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/tree/main/.agents/skills/refactor-plan

Use for substantial structural migrations, not simple one-file bugs. During planning-only requests, do not edit application code. If implementation was already requested, plan and proceed through checkpoints unless a safety STOP condition is reached.

## Workflow

1. Describe the current and target user behavior. Inspect real code, callers, generated OpenAPI client, tests, CI and open PRs.
2. Use `graphify` when an existing graph or complex dependency network makes it worthwhile; otherwise search narrowly.
3. Apply `ponytail`: prefer reuse and the smallest compatible change.
4. List exact affected files, contracts, external dependencies and data ownership (OpenBot workspace Postgres versus **standalone `ipix-open`** domain Supabase/migrated Mastra). Legacy `ipixai` must not remain a runtime dependency.
5. Plan phases in safe order: expand interfaces → implement → migrate callers/data → verify → remove obsolete paths. Include old/new coexistence where needed.
6. For each phase state file, specific change, source/reuse, test, observable checkpoint, STOP condition and rollback.
7. Protect authentication, tenant separation, approval/revision matching, retry idempotency and reliable error handling.

## Output

Current → target · affected files and dependency map · phased implementation · compatibility/migration · tests and CI · rollback/recovery · acceptance criteria.

## Example

Replacing an agent picker requires preserving stored Bot harness IDs, updating desktop and web callers, proving existing Bots reconnect, and **only then** removing obsolete entries. Hiding a framework in the UI alone does not make deleting its image safe.

**Ready gate:** No guessed API contracts, unowned migrations or missing rollback for a risky phase.
