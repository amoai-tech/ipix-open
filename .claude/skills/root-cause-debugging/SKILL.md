---
name: root-cause-debugging
description: "Use to diagnose a reproducible ipix-open failure or regression in browser, Bun tests, CopilotKit streaming, Mastra agents or APIs. Establish a failing signal, isolate cause, fix minimally and prove the regression stays fixed; not for generic PR review or brainstorming."
---

# Root-cause debugging — reproduce before fixing

**Outcome:** A verified failure becomes a small change with a regression test, not a guess based on a log message.

## Diagnostic loop

1. **Capture facts:** exact branch/SHA, user-visible symptom, expected behavior, error or failing assertion, first occurrence and affected path. Redact tokens, request payload secrets, private images, cookies and identifying user data.
2. **Smallest RED signal:** use an existing failing Bun test, local API script or Playwright scenario. Confirm the reported symptom is reachable; if not, establish a measurable condition, and report uncertainty.
3. **Localize:** trace the failing call through the relevant OpenBot source and installed dependency/types. If necessary, narrow by commit/history, structured logs or network responses. Separate symptoms (e.g. 401) from causes (wrong verified actor/project).
4. **Hypothesize and falsify:** name the evidence needed to confirm each likely cause, including auth expiry, tenant mismatch, transient network, stream Stop/race or persistence ownership. Test the highest-impact assumption first.
5. **Minimal correction:** reuse existing runtime and SDK contract. Do not add a replacement state manager, retry registry, custom AG-UI transport or silent fallback just to make the test green.
6. **Prove GREEN:** rerun the original failing signal, nearby regression and required negative path. Record exact commands, SHA, result and what remains unverified.
7. **Clean up:** remove temporary debug output and fixtures, leave an actionable reproduction note and preserve logs/screenshots in a safe, access-controlled location.

**Example:** Chat stops after the first streamed tool result. A targeted test reproduces an interrupted stream. The fix corrects the actual cancellation/recovery contract; a second request completes without duplicating the approved shoot save.

## Sources used in this skill

**Reference — ADAPT:** https://github.com/mattpocock/skills/blob/abeeaf95660ba9e8b7c753eb38f441ca707a8823/skills/engineering/diagnosing-bugs/SKILL.md → feedback loop, repro → minimize → hypothesis → instrumentation → regression. **Do not copy:** background-agent execution assumptions or its own terminology as mandatory infrastructure. **Apply to:** this skill and the changed iPix test location. **Verify:** previously red scenario now green with the same input.

**Reference — ADAPT:** https://github.com/addyosmani/agent-skills/blob/8c99fa36d90068c82d547f7c12a9d67a3e95f4ee/skills/debugging-and-error-recovery/SKILL.md → evidence preservation and stop-the-line error triage. **Do not copy:** unrelated language tooling, global installs or unguarded cleanup commands. **Apply to:** the smallest iPix investigation and regression. **Verify:** targeted test + documented root cause.

**Routing:** `qa-review` finds merge risks; `task-verifier` decides Done; `browser-journey-testing` proves live UI behavior. Only load this skill when a defect is being diagnosed. Never change production data to reproduce a bug.
