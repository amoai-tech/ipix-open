---
name: tasks
description: Use to plan OpenBot/iPix implementation work and Linear tickets with source mapping, smallest implementation and measurable user outcomes.
---

# Tasks — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/tasks/SKILL.md

## OpenBot boundaries
- Follow [standalone iPix Open ownership](../README-ipix.md#architecture-status-and-ownership). The legacy `ipixai` repository supplies **migration references, not final live APIs**; architecture PR #3 is still unmerged.
- Verify installed Bun/React/Vite code first. Respect the original `openbot-copy`, `openbot-data-access` and `openbot-screen-layout` skills. Do not copy old Next.js routes, secrets, or transports.
- Never use browser/model org, user, thread or run IDs as authority. Consequential actions require exact human approval, server-side tenant checks and idempotent durable readback.

## Planning workflow
1. Describe the real user outcome and starting screen. Inspect live Linear task, dependencies, active PRs, **current `ipix-open` head**, and proposed architecture PR #3. Treat the legacy `ipixai` head as source material, not an implementation destination.
2. Read existing repo engineering contracts. Reuse OpenBot functionality, **migrate proven Planner logic only as needed**, and verify official installed SDK features before custom work.
3. For each step record: destination file → exact source URL/file → COPY/ADAPT/REFERENCE ONLY → use → do not copy → change → verify.
4. State data ownership, authorization, human approval, failure/retry behavior, acceptance criteria, cheap tests and real user-journey evidence.
5. Follow acceptance → implementation → focused test → independent review → exact-head CI → owner merge → post-merge readback. Update Linear to Done **only** after applicable evidence; one bounded concern per PR.
## Release-impacting tasks: do not confuse merge with production

For a changed live runtime/deployment configuration, require: the exact tested Git commit, intended deployment platform/project/team/domain, stage-and-test strategy, independent permission/tenant checks, release monitoring, rollback target, post-deploy readback and an owner-approved promotion decision. Check repository-native release workflows before inventing CLI deployment or release tags. For **documentation-only** changes mark deployment **N/A — no runtime change**, with the actual CI outcome distinguished from skip/queue.

**Reference — ADAPT:** https://github.com/addyosmani/agent-skills/blob/8c99fa36d90068c82d547f7c12a9d67a3e95f4ee/skills/shipping-and-launch/SKILL.md → staged rollout, rollback and monitoring evidence. **Do not copy:** generic CI YAML, unapproved automation or vendor-specific commands. **Apply to:** `tasks` step 5 of an affected release task, using current OpenBot GitHub/Vercel/container wiring. **Verify:** exact deployed SHA, authorized QA outcome and rollback plan; no false success from a skipped release job.

## Example
Task: 'The new `ipix-open` app gets an editable plan from the **migrated** iPix Planner without depending on the legacy service.' Gate: authorized QA stream, human approval, one durable save and cross-org denial.
## Verify
Check task criteria against specific files, test command output, CI SHA, approved preview journey and rollback.
