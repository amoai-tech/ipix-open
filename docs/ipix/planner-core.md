# IPI-1493 — Production Planner compute core

This first migration slice runs the existing deterministic iPix shoot planner without a legacy runtime, LLM, customer credentials, database writes, or persistent memory. It is not registered as an OpenBot agent yet. IPI-1492/1504 and IPI-1491 remain required before enabling it.

## Source and changes

- COPY: https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/src/mastra/tools/planning-types.ts and https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/src/mastra/tools/plan-schema.ts — existing result and shoot plan schemas; adapt import paths only.
- COPY: https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/src/lib/shoot/shot-list-from-references.ts and https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/src/lib/commerce/product-ref.ts — existing shot reference ranking and commerce identity contract.
- ADAPT: https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/src/mastra/tools/planning.ts — four existing tools; replace Next.js request-cookie reader with mandatory server-side reader injection.
- ADAPT: https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/src/mastra/tools/compose-shoot-plan.ts — same composition engine; explicitly pass trusted reference readers, validate input, fail when required tools are unavailable. Do not copy the old Next.js authorization client or register tools with browser-supplied reference authority.

Destination: agent-mastra/src/mastra/ipix/. Existing Mastra Core 1.82.0 and locked Zod 4.6.7 are used. No model, memory, remote transport or live application registration is added.

## Verification

Run from agent-mastra:
```bash
bun install --frozen-lockfile --ignore-scripts
bun test src/mastra/ipix/compose-shoot-plan.test.ts
```

Synthetic six-look Shopify request produces 12 proposed assets, 5 draft shots from a single synthetic reference, and a USD 4,365 estimated budget. It is intentionally incomplete: the shots do not establish complete six-look coverage, and missing production fields stay needs_input. Empty references produce no shots or complete budget. Two focused cases passed. No live references or market pricing were asserted.

## Next product slice

IPI-1493: attach verified per-user read-only reference providers, register the actual migrated Production Planner using the existing Mastra adapter and test a real synthetic stream. Never grant the raw reference tool to untrusted model inputs until its reference authority is enforced.

IPI-1508/1509: reuse app/src/lib/copilot/a2ui.ts (standard catalog and Breakdown), and app/src/routes/_authed/_app/index.tsx (existing workspace and composer). Render the plan's objective, deliverables, reference-backed shots, estimated budget and missing inputs. Reuse the same ShootPlan contract; do not create another Planner or use editable UI as authorization.

IPI-1495: use the existing approval and save migrations from IPI-1084/1083. Review the exact revision, revalidate server-side and persist once; do not wire writes before tenant identity and approval gates pass.
