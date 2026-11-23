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

**User journey:** N/A — no affected user journey. [When relevant, replace with actual user → action → result and embed a task-specific Mermaid diagram here.]

**Architecture / data flow:** N/A — no affected cross-system flow. [When relevant, embed verified Mermaid showing UI → API/gateway → Bot/agent → source of truth; include retries/failures when material.]

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
| Applicable path-specific CI / browser / API | N/A | [Relevant job(s), screenshot, query or N/A reason] |
| Multi-replica / gateway / audit, if affected | N/A | [Test and concrete result or N/A reason] |

**Unverified:** [Missing proof or None.]

<!-- CI chooses jobs according to the changed paths. Do not report skipped jobs as execution proof; the aggregate "verify" job decides if the applicable checks passed. For every PASS identify exact SHA, environment and evidence. -->

## 7. Pre-Merge Checklist

- [ ] **Requirements / scope:** Success criteria match the actual task; no unrelated changes.
- [ ] **Review comments:** Recheck each finding against current code; fix valid issues, explain stale claims and resolve blocking threads.
- [ ] **Tests / CI:** Focused tests and the required GitHub `verify` check pass on the current PR head; affected jobs ran or were correctly skipped by CI.
- [ ] **Real workflow:** Run affected UI/API/browser tests; add screenshots where UI changed, and safe failure/retry checks where relevant.
- [ ] **Multi-replica:** Explain request-spanning state storage, second-replica outcome, concurrency guard, cross-replica WebSocket fan-out and new listeners/ports/schedules. Test affected cases or mark N/A with reason.
- [ ] **Gateway / audit:** Acting calls still resolve → decide → audit → act. Refusals and failures are recorded; server-resolvable facts are not trusted from client input.
- [ ] **Changelog:** Add an `Unreleased` entry in `CHANGELOG.md`, or explain why this change has no deployment behavior impact.
- [ ] **Merge readiness:** No blocking defects; required reviews and branch rules satisfied.

**Merge decision:** NOT READY / READY — [Current-head evidence or blocker.]

## 8. Post-Merge Verification & Recovery

<!-- Plan before merge; check tasks only after executing them. Use N/A with a reason for irrelevant steps. -->
- [ ] **1. Verify merge:** Confirm merged SHA, intended files on `main` and relevant main CI.
- [ ] **2. Verify deployment:** Confirm affected server, web, desktop or mobile environments use the intended version, if deployed.
- [ ] **3. Verify database / config:** Check required migrations and API contracts. Avoid destructive production operations without explicit authorization and a recovery plan.
- [ ] **4. Test live result:** Verify affected behavior, durable data, organization boundaries, multi-replica delivery and failures when relevant. Read-only by default; production writes require explicit safe test scope and cleanup.
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
