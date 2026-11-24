---
name: mastra
description: "Use when migrating or reviewing the iPix fashion Production Planner, its tools/workflows, trusted identity, HITL, stream/stop/resume, or AG-UI integration inside standalone ipix-open; do not auto-trigger for unrelated maintenance of the bundled Mastra demo harness."
---

# Mastra — migrate the real iPix Production Planner into OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/tree/13bf2af385ebbe68a78c652daf5cffa3db95df24/src/mastra

**Target:** Standalone `ipix-open`, under [owner-directed PR #3](https://github.com/amoai-tech/ipix-open/pull/3) (unmerged at the 2026-11-23 review checkpoint; verify current state). The legacy `ipixai` runtime is migration source **only**, not a service that the completed app calls. Follow [shared boundaries](../README-ipix.md#architecture-status-and-ownership).

## First inspect the native harness

- `agent-mastra/src/mastra/index.ts` — the **shared generic Mastra Bot harness**, not an iPix Planner implementation. It registers one `openbot` agent and accepts a managed server token. Reuse its plain-Mastra/`@ag-ui/mastra` patterns, **not** its process-wide credentials or tool grants.
- `shared/harnesses.ts` → `reachedThroughMastra()` — current native framework detection and remote agent discovery rules.
- `server/src/copilot.ts` is referenced in the harness comment, but the packaged server source is **absent from this checkout**. Do not invent its auth/transport behavior; verify against the shipped interface or runtime.

## Migration procedure

1. Inspect the legacy Planner dependency closure, current installed `@mastra/core` and Bun compatibility. **COPY+CLEAN** pure planning logic; **ADAPT** auth, imports, storage, workflow persistence and platform-specific code; **DROP** obsolete Next.js routes and duplicate transports.
2. **Default to an isolated iPix Planner service within this same `ipix-open` repository**; keep the generic `agent-mastra/` harness unchanged and treat it as a **REFERENCE ONLY** pattern. PR #3 lists that harness as a candidate; this source inspection shows it is shared, so reconcile that candidate with IPI-1493 before implementation. Reuse a process only if its per-Bot identity, tool grants, secrets, memory and agent selection are independently proven isolated. Never depend on a deployed legacy-repo service.
3. Default-deny tools. Start with planning and authorized reads; do not expose computer/shell, broad MCP, publish/pay/delete, or writes on model request.
4. Verify **per-user** Supabase identity and current membership at the trusted server. Never treat OpenBot session, model text, browser orgId, or shared agent token as business authorization.
5. Before any test run, prove a nonproduction Supabase target **and isolated Mastra memory**; synthetic requests can still create threads/working-memory rows. Stop if the storage boundary is uncertain.
6. Retain exact revised-artifact approval, durable suspend/resume, reauthorization on retry, cancellation/Stop, idempotent save and readback. Use existing domain security tests, adapting runners to this repo and installed versions.

**Example:** A synthetic producer proposes a six-outfit shoot; they edit shot 3, reject one suggestion and approve the final revision. One authorized QA shoot is saved and visible after restart; rejection makes no write.

**Verify:** Static imports/types → focused Planner tests → isolated QA identity/RLS → streamed edit/reject/approve → Stop/retry/suspend/resume → tenant A/B denial → one durable readback. Do not claim migration complete from a diagram or docs.

For source-by-source migration mapping and STOP checks, read [references/planner-migration.md](references/planner-migration.md) before implementing.
