---
name: test-driven-development
description: "Use when implementing or fixing behavior in ipix-open and a focused unit, contract, integration or browser test can first demonstrate the failure. Follow RED → GREEN → refactor with existing Bun/Playwright harnesses; not for documentation or pure copy edits."
---

# Test-driven development — failing behavior first

Define the **observable user/system outcome**, not a private helper's call sequence. Reuse this repository's Bun test infrastructure, existing Playwright/browser journeys and authorized QA integrations.

## RED → GREEN → REFACTOR

1. Inspect `package.json`, current tests and installed versions. Name the actor, input, expected output or persisted effect, and one failure or duplicate case. If no runnable environment exists, say **NOT VERIFIED** instead of inventing a test command.
2. Write the **smallest failing test** through the stable public interface. It must fail *for the intended behavior*, not a missing dependency, wrong test runner or service outage. Preserve the RED output.
3. Implement only enough code to make that test pass. Reuse an existing API, SDK, service or Supabase RPC; do not create a new state or transport mechanism to silence the assertion.
4. Rerun that exact test to show GREEN, then add one nearby negative/concurrency/retry assertion when relevant. Refactor while preserving the observed behavior.
5. Validate the change at the cheapest necessary boundary: focused Bun test → integration/tenant security → typecheck/build if affected → real browser journey if UI affected. On consequential writes always prove reject=0 and approved retry/double submit=one canonical record.
6. Report the RED command/failure, GREEN command/result, exact SHA, skipped gates and confidence limitations. A test that asserts only a mocked handler was called does not prove persistence.

**Example:** Double-clicking a synthetic shoot plan's Approve button creates two records. First write a failing integration assertion against the authorized save API, then fix the idempotency boundary and confirm **one** record after retry/restart.

## Sources and destination

**Reference — ADAPT:** https://github.com/addyosmani/agent-skills/blob/8c99fa36d90068c82d547f7c12a9d67a3e95f4ee/skills/test-driven-development/SKILL.md → red/green/refactor and prove-it bug-fix discipline. **Do not copy:** Jest/Vitest or Node-specific test commands as defaults; use the installed Bun runner and do not make every docs edit run a browser. **Apply to:** this skill and the single existing iPix test suite relevant to the change. **Verify:** the same test was genuinely red before the fix and green afterward.

**Reference — MODEL:** https://github.com/cursor/plugins/blob/005d8f6e8ec057b738adcd08a08b30db0478402d/pstack/skills/principle-test-behavior-not-implementation/SKILL.md → assert externally observable results instead of internal call order. **Do not copy:** project-specific test tooling. **Apply to:** acceptance assertions for changed interfaces and persisted results. **Verify:** changing only internals should not break the test; breaking the user-observable result must.

**Reference — MODEL:** https://github.com/cursor/plugins/blob/005d8f6e8ec057b738adcd08a08b30db0478402d/pstack/skills/principle-make-operations-idempotent/SKILL.md → handle repeated/crashed write steps. **Do not copy:** assumptions that every action is safe to retry without reauthorization. **Apply to:** consequential iPix save tests in isolated QA. **Verify:** current actor/revision checks plus duplicate-submit and readback results.

**Routing:** For an unexplained failure, start with the RED reproducibility steps above and the existing Bun/Playwright tests. `qa-review` finds risks and `task-verifier` independently gates Done. Do not require a sibling PR skill that is not yet merged. No production writes are authorized here.
