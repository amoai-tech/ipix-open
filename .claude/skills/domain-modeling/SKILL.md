---
name: domain-modeling
description: Use to clarify Brand, Campaign, Shoot, Shot, Asset, Bot, Agent, Draft and Approval vocabulary across OpenBot and iPix.
---

# Domain Modeling — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/domain-modeling/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Shared glossary
- **Bot:** OpenBot user-facing entity; **Agent:** execution component such as external Mastra Planner, not a synonym for Bot.
- **Brand:** iPix business context; **Organization:** authenticated tenant (relationship must be verified on server).
- **Campaign:** business goal/creative brief grouping shoots; **Shoot:** one production execution.
- **Shot:** planned capture, not necessarily an image; **Asset:** captured/generated media record with approval and media reference.
- **Draft:** uncommitted proposal; **Approval:** specific human decision; **Commit:** server-authorized durable mutation.
## Method
Cross-check terminology against real iPix schemas, endpoints and OpenBot's `openbot-copy`. Clarify overlapping words with examples; don't create migrations or glossaries without an actual requirement.
## Example
A 24-shot plan produces 18 usable assets: there are 24 planned Shots and 18 Assets, not 24 automatically created images.
