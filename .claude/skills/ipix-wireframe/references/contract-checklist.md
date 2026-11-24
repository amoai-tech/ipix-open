# Implementation wireframe — contract checklist

Use this checklist only for engineering handoff; the main SKILL.md is sufficient for quick sketches.

| Section | Required decision/evidence |
| --- | --- |
| Existing surface | Verified route, component, design reference and relevant PR; source paths in OpenBot |
| User outcome | Actor, action, success signal, alternative/recovery path |
| Information hierarchy | P0/P1/P2/P3 content; real data versus placeholder |
| Component map | Reuse/Adapt/Create/Defer with actual paths |
| Data contract | OpenAPI/verified backend source, missing/null cases, authorization and durable ownership |
| State matrix | Loading, empty, error, proposed, review, reject, approve, saving, success, retry/resume |
| AI governance | Proposal ≠ action; user edits/reviews; server validates artifact revision + tenant + permission; idempotent write/readback |
| Responsive | Desktop/tablet/mobile zones, overflow, action reachability |
| Accessibility | Headings, names, tab order, focus after dialogs, keyboard action, status/error announcement |
| Verification | Concrete assertions for success, rejection, expired/stale approval, duplicate request, errors, mobile, keyboard |

## Suggested Playwright cases

1. Empty result → honest empty state and reachable primary action.
2. AI proposal → editable review; reject → no durable write.
3. Approve exact draft → server revalidates → one write → visible readback.
4. Stale artifact, wrong tenant or duplicate approval → safe refusal/no extra write.
5. Mobile width and keyboard navigation → primary action and recovery remain reachable.
6. Provider failure → recoverable error; no fabricated success.

Do not claim these checks passed until tests actually run. Inspect real API/schema/routes rather than copying source iPix file paths.

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/tree/main/.agents/skills/ipix-wireframe/references
