---
name: domain-modeling
description: Use to clarify Brand, Campaign, Shoot, Shot, Asset, Bot, Agent, Draft and Approval vocabulary across OpenBot and iPix.
---

# Domain Modeling — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/domain-modeling/SKILL.md

## OpenBot boundaries
- Follow [standalone iPix Open ownership](../README-ipix.md#architecture-status-and-ownership). The legacy `ipixai` repository supplies **migration references, not final live APIs**; architecture PR #3 is still unmerged.
- Verify installed Bun/React/Vite code first. Respect the original `openbot-copy`, `openbot-data-access` and `openbot-screen-layout` skills. Do not copy old Next.js routes, secrets, or transports.
- Never use browser/model org, user, thread or run IDs as authority. Consequential actions require exact human approval, server-side tenant checks and idempotent durable readback.

## Shared glossary
- **Bot:** OpenBot user-facing entity; **Agent:** execution component such as external Mastra Planner, not a synonym for Bot.
- **Brand:** iPix business context; **Organization:** authenticated tenant (relationship must be verified on server).
- **Campaign:** business goal/creative brief grouping shoots; **Shoot:** one production execution.
- **Shot:** planned capture, not necessarily an image; **Asset:** captured/generated media record with approval and media reference.
- **Draft:** uncommitted proposal; **Approval:** specific human decision; **Commit:** server-authorized durable mutation.
## Method
Cross-check terminology against migrated/verified `ipix-open` schemas, approved legacy business contracts and `openbot-copy`. For a disputed word: describe an actual example → name the competing definitions → identify the owning data field and user-visible label → record one agreed decision. Do not invent migrations to rename concepts.
## Example
A 24-shot plan produces 18 usable assets: there are 24 planned Shots and 18 Assets, not 24 automatically created images. Record which status is planned, captured, selected and approved before computing completion.
