---
name: mastra
description: Use for connecting or reviewing the remote iPix Mastra Production Planner through OpenBot, including agent discovery, auth, HITL, streaming, stop/retry and durable approvals; not for edits to the bundled OpenBot agent-mastra harness.
---

# Mastra — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/mastra/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Remote Planner integration
Scope: the remote iPix Planner integration only. OpenBot also ships `agent-mastra/`; edits to that bundled harness require its own installed Mastra types and harness contracts, not these remote-Planner assumptions.
1. Locate the existing iPix Production Planner and verify its currently installed Mastra types, authentication endpoint and server-side identity contract.
2. Prefer OpenBot's native remote agent/AG-UI connection; do not install a duplicate Mastra runtime, invent transport or create another run registry.
3. Keep tools as read/compute/propose until a server-approved exact action is authorized.
4. Verify active org through iPix server membership; browser identifiers are hints, never authority.
5. Handle stream errors, stop/retry, resume, stale approval and idempotent saves with persistent evidence.
6. Do not log secrets or tenant payloads in model-visible traces. Check https://mastra.ai/docs and https://docs.copilotkit.ai/mastra only after installed types.
## Example
A Bot requests a structured 24-shot plan from the remote Planner; an operator edits two shots, approves, and iPix saves exactly the edited artifact.
## Verify
Authenticated stream, reject, double-click approval, cancellation, restart, Org A/Org B denial and durable reread.
