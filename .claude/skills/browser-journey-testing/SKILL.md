---
name: browser-journey-testing
description: "Use whenever asked to verify or audit a real ipix-open browser user journey with Playwright or Chrome DevTools: signed-in Bot conversations, editable proposals, screenshots, network errors, refresh and persistence. If QA is unavailable, report NOT VERIFIED; not for docs-only or backend-only tasks."
---

# Browser journey testing — prove what a user can do

A screenshot, mocked component or successful network request is not proof that a fashion producer's data was saved. This skill verifies **observed browser behavior**. Start with the existing OpenBot harness and test scripts; never build another browser test framework because this skill exists.

## First inspect this repository

1. Read the changed UI and existing tests in `app/`, `app/tests/` and `tests/`. For Bot journeys inspect `app/src/lib/copilot/provider.tsx`, `app/src/lib/copilot/a2ui.ts` and the gallery/approval components first.
2. Discover the installed Bun/Playwright commands from `package.json` and existing test config. Use the repository's current browser/debug tooling or connected Chrome DevTools. **Do not blindly install a second browser driver.**
3. Select a disposable **nonproduction** OpenBot tenant, Auth/database and Mastra memory target. Use an isolated browser profile; never attach a developer's signed-in personal Chrome session by default. Confirm that a real Planner route exists before trying a Planner scenario.
4. State one actor, starting screen, action and observable result before opening the browser.

## Real user journey

1. Capture exact tested SHA, base URL, browser size, test identity class and expected result without credentials or account secrets.
2. Perform the action in a real browser. Observe DOM, network status, console errors, loading/stream/error states and keyboard focus. Use stable selectors and meaningful assertions; do not accept an AI-generated claim of success as an application result.
3. Exercise the applicable negative path: denied tenant access, expired session, failed stream, double submit, Stop, refresh or recoverable retry. For consequential writes, verify *no write on reject* and *one canonical record on approved retry* via the authorized QA read API.
4. Prove durable results after refresh/reconnect **and canonical readback** from an authorized QA API for any consequential write, or mark **NOT VERIFIED** if the environment is not available. Retain redacted screenshot/trace links, not cookies, personal data, raw auth headers or private brand images.
5. Run a cheapest relevant browser regression before wider suites. If launch or sign-in fails, report the blocked step and runtime error; do not invent successful screenshots or skip to production.

**Example:** Synthetic producer opens a six-look proposal, edits look 3, rejects another, approves the exact revision, refreshes and sees one saved plan. If the Planner has not yet been migrated, this is an **acceptance scenario**, not a completed test.

For a repeatable interrupted conversation test, follow the [existing OpenBot connection-recovery QA scenario](references/connection-recovery-qa.md). It links actual channel and history tests, requires network 502 evidence, refresh and canonical saved-message readback, and distinguishes simulated tests from live QA.

## Sources used in this skill

**Reference — ADAPT:** https://github.com/addyosmani/agent-skills/blob/8c99fa36d90068c82d547f7c12a9d67a3e95f4ee/skills/browser-testing-with-devtools/SKILL.md → browser DOM/network/console/screenshot workflow. **Do not copy:** `@latest` installs, browser profile attachment or assumptions that Chrome DevTools MCP is configured. **Apply to:** this skill and actual existing OpenBot Playwright tests when a user-facing task needs proof. **Verify:** error-free/negative path screenshot + network assertion.

**Reference — MODEL:** https://github.com/cursor/plugins/blob/005d8f6e8ec057b738adcd08a08b30db0478402d/pstack/skills/create-verification-skill/SKILL.md → discover how the actual app launches, drive it and capture observable evidence. **Do not copy:** another generated verification harness or its Cursor-specific files. **Apply to:** the existing test suite and reproducible browser QA plan. **Verify:** original test script replays successfully in isolated QA.

**STOP:** No isolated Auth/storage, no signed-in QA actor, unreproducible external service, or missing runtime route means **NOT VERIFIED**, not PASS. This skill never authorizes production writes.
