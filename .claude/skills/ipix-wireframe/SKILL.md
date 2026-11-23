---
name: ipix-wireframe
description: "Use when designing, auditing, or redesigning iPix Open screens, user journeys, ASCII wireframes, responsive layouts, Figma handoffs, prototypes, and AI approval flows before implementation."
---

# iPix Wireframe — buildable screen contracts for OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/tree/main/.agents/skills/ipix-wireframe

**Outcome:** Make a screen implementable and testable, not merely attractive.

**Workflow:** **Prove → Journey → Wireframe → Contract → Handoff → Verify**.

## Boundaries

- Inspect the current OpenBot React/Vite routes, components, design patterns, OpenAPI client and applicable running behavior. Do not assume iPix Next.js App Router, Supabase tables, Mastra endpoints, or design paths exist here.
- Reuse existing OpenBot UI first. Follow `openbot-screen-layout` for screen structure, `openbot-copy` for wording, `openbot-data-access` for browser/API integration, and `copilotkit` for agent surfaces.
- iPix's Supabase business data and Cloudinary assets belong to the iPix application. Draw the API/agent boundary explicitly; never invent accessible fields, endpoints, or permissions.
- AI proposes; the operator reviews or edits; the server reauthorizes the **exact approved artifact** before any consequential write; idempotent execution and durable readback establish success.
- Use Figma or clickable prototypes only where visual parity or interaction testing adds value. ASCII is the default for quick engineering collaboration.

## 1. Prove current behavior

Identify the user goal, relevant route, existing components, agent interaction, source of truth, authorization/write path, related task/PR, and current desktop/mobile behavior. If functionality already exists, report reuse instead of redesigning.

## 2. Map the user journey

Describe **entry → user action → AI proposal (if any) → edit/reject/approve → authorized action → visible result**. Include empty/loading/error, rejection, retry, cancellation, and resume where they matter.

For cross-service or approval workflows, invoke `mermaid-diagrams` and make its **one smallest useful diagram** describe the same journey as the wireframe.

## 3. Draw an ASCII wireframe

Show primary task, information hierarchy, navigation, controls and feedback. Mark priority: P0 essential; P1 important; P2 supporting; P3 advanced. Identify desktop and mobile changes, not just scaled boxes.

Example — proposed campaign review, not an assertion of implemented UI:

```text
+-------------------------------------------------+
| Campaign proposal                    [Back]      |
| Goal: Spring collection                         |
|-------------------------------------------------|
| Items / proposed deliverables                   |
| [editable plan]             [preview / evidence]|
|                                                 |
| AI status: proposed — not saved                 |
| [Reject] [Edit] [Approve exact draft]           |
+-------------------------------------------------+
Mobile: stacked proposal → preview → sticky actions
```

## 4. Specify the implementation contract

For each meaningful screen/state provide:
- **Reuse map:** existing file/component → reuse / adapt / create / defer.
- **Data:** precise API/schema source, nullable/empty fields, read/write ownership; label unknowns **unverified**.
- **State matrix:** loading, ready, empty, error, proposed, reviewing, approved/rejected, saving, saved, retry.
- **AI and approval:** exact artifact identity/version, permission check on server, failure path and idempotency expectations.
- **Responsive:** desktop/tablet/mobile layout and keyboard/focus behavior.
- **Accessibility:** semantic labels, focus order, error announcement and accessible controls.
- **Verification:** acceptance criteria plus Playwright scenarios tied to observable outcomes.

For detailed contract and test matrices, read [references/contract-checklist.md](references/contract-checklist.md) only when producing an implementation-ready handoff.

## 5. Handoff and verify

Hand off the smallest safe code change, real paths, dependencies and out-of-scope work to `tasks` / `task-verifier`. Verify the main journey, failure states, keyboard use, mobile layout and existing-route regression. An approval test must show **reject writes nothing** and **approve commits once** after server revalidation.

**Output:** Goal · Current evidence · Journey · ASCII wireframe · Reuse map · Data/states/AI contract · Responsive/a11y · Risks · Acceptance criteria · Tests.

**Ready gate:** Implementation requires no guessed fields or authority. Block on tenant boundary, unsafe approval, unaudited write, or broken source-of-truth assumptions.
