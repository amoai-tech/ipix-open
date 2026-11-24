---
name: copilotkit
description: "Use for OpenBot's CopilotKit v2-entrypoint agent UI: streamed AI proposals, OPENBOT_UI/A2UI components, interactive shot cards and tables, gallery rendering and exact human review. Inspect existing React/Vite code before adding a renderer."
---

# CopilotKit — reuse existing OpenBot generative UI

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/copilotkit/SKILL.md

**Target architecture:** [standalone iPix Open migration](../README-ipix.md#architecture-status-and-ownership). Existing UI lives in this repo; legacy `ipixai` UI is source-only.

## Installed-version rule

OpenBot's manifest pins `@copilotkit/react-core@1.88.0` and `@ag-ui/core@1.0.2`; its **actual source uses the v2 entry points** `@copilotkit/react-core/v2` and `@copilotkit/react-core/v2/generative-ui`. Inspect the installed exports and code first; neither package's numeric version alone nor an iPix v2 example proves API compatibility.

| Need | Reuse first (real source path / symbol) |
| --- | --- |
| Authenticated conversation | `app/src/lib/copilot/provider.tsx` → `CopilotProvider`, relative `/api/copilotkit`, credentials and organization header |
| Standard cards/table/text/form | `app/src/lib/copilot/a2ui.ts` → `OPENBOT_UI`, `createGenerativeUI`, `standardUI` |
| Specialized image/gallery | `app/src/lib/copilot/gallery-registry.ts` and `gallery-tools.tsx` |
| Read-only tool display | `app/src/lib/copilot/handoff-tool.tsx` |
| Computer-step review | `app/src/lib/copilot/approval-tools.tsx` → `InlineApproval`; **not proof** of iPix business approval |
| Browser data and layout | `openbot-data-access` and `openbot-screen-layout` (configuration screens only) |

## Workflow

1. Verify the proposed result schema, current UI surface, capabilities, and component grants. Reuse `OPENBOT_UI`/native cards before designing a custom renderer or editing the global provider.
2. Preserve partial, completed, failed, retry and reconnect states. Render **proposed ≠ persisted**; user edits must survive streaming and refresh where supported.
3. Make a specialized editable shot list only if native components cannot express the required edit/review experience. Separate rendering from authorization.
4. For consequential actions, route the **exact approved revision** to an authenticated iPix server path in this repo; verify Supabase membership and idempotency. Do not reuse computer-step `InlineApproval` as a substitute for domain approval without proving the contract.
5. Do not create a parallel CopilotKit provider, duplicate query cache, unsafe direct browser Supabase write, or copied Next.js components. Verify behavior against installed types and [official v2 docs](https://docs.copilotkit.ai/reference/v2).

**Example:** A producer edits row 3 in a generated six-outfit shoot plan. The UI sends that exact revision for authorized review; it never declares the model's earlier text saved.

**Verify:** Existing chat still works; native gallery/cards render; streaming edits survive; reject=0 writes; approve once=1 persisted result; expired identity and cross-tenant cases refuse safely.
