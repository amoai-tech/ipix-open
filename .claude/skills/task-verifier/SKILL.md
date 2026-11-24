---
name: task-verifier
description: Use for independent verification of OpenBot/iPix implementation claims, PR completion, tests and real user-journey proof.
---

# Task Verifier — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/task-verifier/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Quick before changes
- Re-open task, inspect clean default branch and active PRs, check whether the alleged gap already has a working fix.
## Full before Done
Apply gates based on the behavior the task affects. For unaffected gates, record `N/A — reason`; they do not block Done. Changes touching consequential actions must verify approval, tenant isolation, exactly-once persistence and retry safety; these gates cannot be marked N/A. Check stop/stream recovery when the run lifecycle changes.
1. Inspect exact diff against scope, architecture and acceptance criteria.
2. Run the cheapest decisive proof: static inspection → focused Bun tests → typecheck → build/integration when appropriate.
3. Verify real authenticated flow, errors and server response with test accounts.
4. Test Org A vs Org B, rejected/stale approvals, double-click, stop/retry and stream failures.
5. Confirm approved data is saved exactly once and read back; no writes after reject.
6. Record PASS/FAIL/NOT VERIFIED for every gate, with commands, commit SHA, logs and screenshots if available.
## Example
Click Approve twice: exactly one shoot exists; both authorized retries report the same persisted result.
