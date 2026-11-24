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
## Prevent repeated agent mistakes

When the **same failure class** appears in two independent PRs, do not just add more prose. Record the concrete recurrence and eliminate it at the strongest affordable layer: architecture or module boundary → installed type contract → lint/CI prohibition → observable regression test → reviewer instruction only if enforcement is impossible. Test the new guard against the actual old failure. Do not make speculative global lint rules from a single unproven complaint.

**Reference — ADAPT:** https://github.com/cursor/plugins/blob/005d8f6e8ec057b738adcd08a08b30db0478402d/pstack/skills/correct/SKILL.md → convert repeated agent errors to enforceable guardrails. **Do not copy:** global agent installation or unconditional auto-commit/merge workflow. **Apply to:** `qa-review`'s repeated finding, then an approved local test/lint rule if evidence justifies it. **Verify:** known bad fixture fails and corrected code passes; no extra false-positive failure.

## Example
After switching organizations, a producer clicks Approve on an old proposal: server rechecks identity/tenant and blocks stale action.
