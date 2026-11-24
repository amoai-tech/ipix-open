---
name: qa-review
description: Use to review OpenBot/iPix features and PRs for negative paths, compatibility, security and merge risks.
---

# Qa Review — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/qa-review/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Risk-based QA
1. Establish the intended user outcome and compare with actual diff/runtime. Mark missing evidence NOT VERIFIED.
2. Check user flow: Bot receives request → authorized Planner draft → edit/reject/approve → read saved result.
3. Check meaningful negative paths: unauthenticated, Org B, stale draft, model outage, stream interruption, cancellation, repeated approval, server 409 and recovery.
4. Preserve existing OpenBot three skills, generated API behavior and general Bot flows.
5. Report every evidence-backed merge risk and up to five high-value actor/action/expected-outcome tests, with PASS/FAIL/NOT VERIFIED.
## Example
After switching organizations, a producer clicks Approve on an old proposal: server rechecks identity/tenant and blocks stale action.
