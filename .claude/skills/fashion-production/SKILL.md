---
name: fashion-production
description: Use for fashion shoot briefs, shot lists, lighting plans, call sheets, model direction, deliverables, asset QC and the iPix Production Planner.
---

# Fashion Production — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/fashion-production/SKILL.md

## OpenBot boundaries
- Follow [standalone iPix Open ownership](../README-ipix.md#architecture-status-and-ownership). The legacy `ipixai` repository supplies **migration references, not final live APIs**; architecture PR #3 is still unmerged.
- Verify installed Bun/React/Vite code first. Respect the original `openbot-copy`, `openbot-data-access` and `openbot-screen-layout` skills. Do not copy old Next.js routes, secrets, or transports.
- Never use browser/model org, user, thread or run IDs as authority. Consequential actions require exact human approval, server-side tenant checks and idempotent durable readback.

## Shoot production
1. Gather approved Brand DNA, products, target channels, date, budget and creative constraints; mark unknown inputs.
2. Propose a brief with visual direction, mood, intended audience and deliverables.
3. Prepare a shot list: ID, product/look, composition, talent/props, lighting/setup, channel/crop, priority, estimated duration.
4. Group shots by setup to reduce location/lighting changes. Produce a call sheet with roles, times, locations, breaks, contacts and contingencies.
5. Show budget assumptions separately from confirmed quotes; never invent vendor availability.
6. Separate drafts from approved shoots. No bookings, spend, publishing or durable saves without explicit approval.
7. After shooting, map captured assets to shots, flag missing deliverables and explain reshoots.
8. Use [references/shot-list-template.md](references/shot-list-template.md) for a deliverable-ready plan, not for a quick answer. Ensure every proposed shot maps to a target channel and approved version.
## Example
Maaji-style swimwear: plan 24 shots across studio and beach setups; compare e-commerce crops with social hero frames and note schedule risks.
## Verify
Shot count, deliverables, timing, assumptions, missing assets, approved version and duplicate-save protection.
