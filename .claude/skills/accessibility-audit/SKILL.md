---
name: accessibility-audit
description: "Use when auditing an existing ipix-open web screen, CopilotKit-generated form/table/gallery or responsive web UI for keyboard, screen reader, contrast and WCAG 2.2 AA problems. Verify rendered web in a browser; not for native Expo/React Native mobile, backend-only or rough wireframe tasks."
---

# Accessibility audit — usable fashion UI for everyone

**Outcome:** A producer using keyboard or assistive technology can understand and operate the same essential workflow as a mouse user.

## Audit only the actual changed surface

1. Identify the rendered page/component and user task. Start with the existing Bot Setup screen in `app/src/components/bot-profile/setup.tsx` and its `app/tests/bot-setup-agent-url.test.tsx` (the Agent URL edit dialog with Save, Cancel and server validation). For generated UI inspect `app/src/lib/copilot/a2ui.ts`, existing gallery/approval components and `openbot-screen-layout` where applicable. If the page does not yet exist, define an acceptance scenario; do not claim it was tested.
2. Discover **installed** Playwright/a11y tools. Reuse existing browser harness, accessibility scripts or approved axe-core/pa11y versions. Do not execute arbitrary `npx @latest` installs or claim that automated audits prove complete WCAG conformance.
3. Run an automated WCAG 2.2 AA scan on isolated QA where available, recording URL, SHA, viewport, ruleset, tool version and every evidenced violation. If tooling is not installed, document the precise gap and use verified manual browser checks without calling the automated gate a PASS.
4. **Manually** test keyboard-only Tab/Shift+Tab, Enter/Space, Escape, visible focus, dialog focus trap/return, status announcements and any dynamically streaming tables/cards. Confirm labels, alt text for meaningful product images and readable error messages; test zoom and responsive web viewports. Native Expo/React Native in `mobile/` needs a separate platform-specific accessibility audit, not a browser-only result.
5. **Audit-only requests: report findings and stop.** Only when explicitly asked to implement fixes, change the smallest verified violation using existing accessible controls. For AI proposals keep proposed/saved state distinct and preserve exact server approval.
6. **Only when a fix was explicitly requested and applied**, re-run the failing case and a nearby regression. For an audit-only request, report observed findings and stop without changing code or claiming post-fix testing. Record **PASS / FAIL / NOT VERIFIED / N/A-with-reason** plus screenshot/video/axe report where safe. Never upload private customer images or authenticated browser storage as CI artifacts.

**Example (existing screen):** A keyboard-only operator opens Bot Setup's Agent URL edit dialog, reaches its input, Cancel and Save controls, checks visible error text for a rejected private endpoint, closes the dialog and verifies focus returns to the edit button. The existing Bun test verifies server validation/readback via mocked APIs; a keyboard/assistive-technology browser audit remains **NOT VERIFIED** until run in isolated QA.

## Source → target → verification

**Reference — ADAPT:** https://github.com/addyosmani/agent-skills/blob/8c99fa36d90068c82d547f7c12a9d67a3e95f4ee/skills/accessibility-engineering/SKILL.md → automated and manual audit sequence, WCAG 2.2 AA evaluation and evidence. **Do not copy:** pinned CLI install commands that may conflict with this repository, unrelated web app assumptions or a claim of accessibility certification from automation alone. **Apply to:** this skill, then the actual iPix Open React component/browser test under review. **Verify:** failed issue reproduced, fixed, and keyboard/assistive-technology path retested.

**Reference — REFERENCE ONLY:** https://www.w3.org/WAI/WCAG22/quickref/ → relevant WCAG 2.2 success criteria. **Do not copy:** large static checklists as a substitute for actual rendered-page testing. **Apply to:** specific detected control, heading, table or status-message defect. **Verify:** observed user interaction and exact criterion.

**STOP:** No running UI, unsafe account, unavailable assistive-tech environment or inaccessible tool output → mark the affected gate **NOT VERIFIED**, not PASS.
