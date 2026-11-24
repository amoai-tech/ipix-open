<!-- iPix Open / OpenBot. Complete only relevant fields. Remove placeholders; explain N/A. Before merge, leave post-merge boxes unchecked. Do not claim unverified PASS. -->

## 1. Purpose

**Purpose:** [What problem does this PR solve and why is it needed?]

**Expected outcome:** [What works better for the user or operator?]

**Real-world example:** [User / admin] → [action] → [visible result; saved result if relevant].

**Issue / task:** [Verified GitHub issue or task link; otherwise N/A.]

**Type / tech stack:** [Runtime / Tests / Docs / Infrastructure] · [Only systems changed, e.g. React/Vite, Bun, Hono, CopilotKit, AG-UI, PostgreSQL, Tauri.]

## 2. Changes & Improvements

**Implemented**
- [Main improvement]
- [Second improvement, if needed]
- [Third improvement, if needed]

**Existing functionality reused:** [Current component/API/service/DB operation and why.]

**Files to review:** [3–5 paths with what each reviewer should check.]

**How to reproduce:** [Exact user steps, local command or environment URL.]

**Risks / out of scope:** [Important limitations or N/A.]

## 3. User Journey & Architecture

**User journey:** N/A — no affected user journey.
<!-- When relevant, replace with actual user → action → result and embed a task-specific Mermaid diagram here. -->

**Architecture / data flow:** N/A — no affected system flow.
<!-- When relevant, show the real app → server → Bot → database journey with Mermaid. Include failure and retry paths when useful. -->

<!-- Embed real Mermaid code blocks directly in the PR description for meaningful user journeys or architecture changes. Never leave placeholder diagrams visible or treat diagrams as test evidence. -->

## 4. Best Reference URLs

<!-- Only when useful: up to 3–5 exact, verified official docs, official GitHub repo paths or version-compatible examples. Read the source and say how it changes this task. Otherwise say N/A — existing code/tests sufficient. -->

| Reference URL | What matters | Exactly how to apply it |
| --- | --- | --- |
| [Exact official documentation / GitHub URL] | [Relevant API, version, example or contract] | [Specific implementation file, step or verification] |

## 5. Success Criteria

<!-- Replace with 1–4 measurable outcomes; mark complete only with proof. -->
- [ ] [Primary behavior or correction works.]
- [ ] [Correct result and persistence, where applicable.]
- [ ] [Relevant auth, error, retry and concurrency behavior works.]
- [ ] [Affected real-world journey passes, if applicable.]

## 6. Tests & Evidence

**Tested PR head:** [Exact commit SHA]

| Check | Result | Evidence (command, environment, SHA / link) |
| --- | --- | --- |
| Focused tests | NOT RUN | [Exact `bun test ...` or other relevant command] |
| Format / lint / types (if relevant) | NOT RUN | [`bun run format:check`, `bun run lint`, `bun run typecheck`] |
| GitHub CI: `verify` | PENDING | [CI run link for the current PR head] |
| Browser / API tests (when needed) | N/A | [Test results or why not needed] |
| Docker image build (when Dockerfile changes) | N/A | [Request `full-ci` and link the passing `component-dockerfiles` job] |
| Multiple servers / permissions, if changed | N/A | [Test result or why not needed] |

**Unverified:** [Missing proof or None.]

<!-- Most CI checks depend on which files changed. Exception: `component-dockerfiles` runs on PRs only with the `full-ci` label. `verify` accepts skipped jobs as passing, so a green `verify` does NOT prove Docker images built. For Dockerfile changes, ask a maintainer to add `full-ci` and confirm `component-dockerfiles` passed. For every PASS record the tested SHA, environment and evidence. -->

## 7. Pre-Merge Checklist

- [ ] **Requirements / scope:** Success criteria match the actual task; no unrelated changes.
- [ ] **Review comments:** Recheck each finding against current code; fix valid issues, explain stale claims and resolve blocking threads.
- [ ] **Tests / CI:** Focused tests and GitHub `verify` pass on the latest commit. Check which jobs actually ran—skipped is not the same as tested.
- [ ] **Dockerfiles:** If a Dockerfile changed, ask for the `full-ci` label and confirm `component-dockerfiles` passed. `verify` can pass even when the Dockerfile build was skipped.
- [ ] **Real workflow:** Run affected UI/API/browser tests; add screenshots where UI changed, and safe failure/retry checks where relevant.
- [ ] **Multiple servers:** If another server handles the next request, does saved data remain correct? What prevents duplicate actions? Do browser updates reach all servers? Are new scheduled jobs, listeners and ports safe? Test what changed or explain N/A.
- [ ] **Permissions and logs:** Bot actions still pass through the server's permission checks (`resolve → decide → audit → act`). Record denied/failed actions; look up trusted facts on the server instead of accepting them from the browser.
- [ ] **Changelog:** Add an `Unreleased` entry in `CHANGELOG.md`, or explain why this change has no deployment behavior impact.
- [ ] **Merge readiness:** No blocking defects; required reviews and branch rules satisfied.

**Merge decision:** NOT READY / READY — [Current-head evidence or blocker.]

## 8. Post-Merge Verification & Recovery

<!-- Plan before merge; check tasks only after executing them. Use N/A with a reason for irrelevant steps. -->
- [ ] **1. Verify merge:** Confirm merged SHA, intended files on `main` and relevant main CI.
- [ ] **2. Verify deployment:** Confirm affected server, web, desktop or mobile environments use the intended version, if deployed.
- [ ] **3. Verify database / config:** Check required migrations and API contracts. Avoid destructive production operations without explicit authorization and a recovery plan.
- [ ] **4. Test live result:** Check the affected feature, saved data, access rules, updates across servers and error handling when relevant. Start with read-only checks; writing tests need explicit authorization, safe test data and cleanup.
- [ ] **5. Fix failures:** Identify the root cause; make the smallest correction through the normal PR process, then retest and redeploy or roll back safely.
- [ ] **6. Update GitHub / task:** Record URLs, screenshots/logs, tested SHA, fixes and remaining work. Close only when acceptance criteria are proven.
- [ ] **7. Clean up:** Remove obsolete worktrees/branches only after ensuring no uncommitted or unrelated work is lost.

**Recovery plan:** [Revert / safe forward fix, or N/A for a docs-only change.]

### Final Post-Merge Results

| Item | Result / evidence |
| --- | --- |
| Merge / deployed SHA | NOT VERIFIED |
| Main CI / deployment | NOT VERIFIED / N/A |
| Real-world functionality | NOT VERIFIED / N/A |
| Multi-replica / security / audit | NOT VERIFIED / N/A |
| Errors fixed | None / [Problem → fix → proof] |
| GitHub / task update | NOT VERIFIED |
| Cleanup | NOT VERIFIED |
| Final verdict | PENDING / PASS / PARTIAL / FAIL |
