---
name: fashion-production
description: Use for fashion shoot briefs, shot lists, lighting plans, call sheets, model direction, deliverables, asset QC and the iPix Production Planner.
---

# Fashion Production — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/fashion-production/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Shoot production
1. Gather approved Brand DNA, products, target channels, date, budget and creative constraints; mark unknown inputs.
2. Propose a brief with visual direction, mood, intended audience and deliverables.
3. Prepare a shot list: ID, product/look, composition, talent/props, lighting/setup, channel/crop, priority, estimated duration.
4. Group shots by setup to reduce location/lighting changes. Produce a call sheet with roles, times, locations, breaks, contacts and contingencies.
5. Show budget assumptions separately from confirmed quotes; never invent vendor availability.
6. Separate drafts from approved shoots. No bookings, spend, publishing or durable saves without explicit approval.
7. After shooting, map captured assets to shots, flag missing deliverables and explain reshoots.
## Example
Maaji-style swimwear: plan 24 shots across studio and beach setups; compare e-commerce crops with social hero frames and note schedule risks.
## Verify
Shot count, deliverables, timing, assumptions, missing assets, approved version and duplicate-save protection.
