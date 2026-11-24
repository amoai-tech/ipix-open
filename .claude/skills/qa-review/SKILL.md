---
name: qa-review
description: Use to review OpenBot/iPix features and PRs for negative paths, compatibility, security and merge risks.
---

# Qa Review — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/qa-review/SKILL.md

## OpenBot boundaries
- Follow [standalone iPix Open ownership](../README-ipix.md#architecture-status-and-ownership). The legacy `ipixai` repository supplies **migration references, not final live APIs**; architecture PR #3 is still unmerged.
- Verify installed Bun/React/Vite code first. Respect the original `openbot-copy`, `openbot-data-access` and `openbot-screen-layout` skills. Do not copy old Next.js routes, secrets, or transports.
- Never use browser/model org, user, thread or run IDs as authority. Consequential actions require exact human approval, server-side tenant checks and idempotent durable readback.

## Risk-based QA
Choose **feature mode** (review intended flow, missing states and tests before implementation) or **PR mode** (compare exact diff, requirements and regression evidence). This skill finds risks; `task-verifier` independently gates Done.

1. Establish the intended user outcome and compare with actual diff/runtime **only where applicable**. Mark missing evidence NOT VERIFIED.
2. For a Planner/action change, check: Bot request → authorized Planner proposal → edit/reject/approve → canonical readback. For docs-only changes, inspect actual affected documentation and skill triggering instead.
3. Check meaningful negative paths: unauthenticated, Org B, stale draft, model outage, stream interruption, cancellation, repeated approval, server 409 and recovery.
4. Preserve existing OpenBot three skills, generated API behavior and general Bot flows.
5. Report **every distinct evidence-backed merge risk**, even when more than five exist. Suggest **up to five** highest-value actor/action/expected-outcome tests, each PASS / FAIL / NOT VERIFIED; distinguish confirmed bugs from hypotheses.
## Example
After switching organizations, a producer clicks Approve on an old proposal: server rechecks identity/tenant and blocks stale action.
