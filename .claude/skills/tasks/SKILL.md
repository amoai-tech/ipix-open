---
name: tasks
description: Use to plan OpenBot/iPix implementation work and Linear tickets with source mapping, smallest implementation and measurable user outcomes.
---

# Tasks — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/tasks/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Planning workflow
1. Describe the real user outcome and starting screen. Inspect live Linear task, dependencies, active PRs, both repo heads and current behavior.
2. Read relevant repo engineering contracts. Reuse OpenBot functionality, current iPix Planner and official SDK features before custom work.
3. For each step record: destination file → exact source URL/file → COPY/ADAPT/REFERENCE ONLY → use → do not copy → change → verify.
4. State data ownership, authorization, human approval, failure/retry behavior, acceptance criteria, cheap tests and real user-journey evidence.
5. Update Linear only after observable proof. One bounded concern per PR.
## Example
Task: 'OpenBot user gets an editable plan from iPix without a second Mastra runtime.' Gate: authenticated stream, human approval, one durable save and cross-org denial.
## Verify
Check task criteria against specific files, test command output, CI SHA, approved preview journey and rollback.
