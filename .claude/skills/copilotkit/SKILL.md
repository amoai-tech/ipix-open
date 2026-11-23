---
name: copilotkit
description: "Use for OpenBot CopilotKit v2 and AG-UI: remote agent rendering, streamed proposals, editable shot cards and human review."
---

# Copilotkit — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/copilotkit/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Generative interface
1. Inspect OpenBot's existing `@copilotkit/react-core`, `@ag-ui/core`, runtime and gallery component usage; use pinned package types.
2. Keep the existing Bot conversation surface. Prefer native message/card components; create a renderer only if the actual Planner result needs it.
3. Stream partial, pending, completed, failed and reconnected states without claiming a draft has been saved.
4. Render an editable proposal (e.g. shot list) and let user approve, revise or reject.
5. Route approved exact data through the authenticated server, not direct browser writes; revalidate organization and idempotency.
6. OpenBot copy/layout/data-access skills override old iPix patterns. Official: https://docs.copilotkit.ai/mastra
## Example
A 24-row shoot plan streams into chat. A producer edits a lighting row; the saved record contains the edit, not a stale model draft.
## Verify
Streaming, editing, rejection, reconnect, auth expiry, duplicate approval and data read-back.
