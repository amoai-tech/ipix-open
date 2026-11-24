<!-- iPix Open / OpenBot. Complete only relevant fields. Remove placeholders; explain N/A. Before merge, leave post-merge boxes unchecked. Do not claim unverified PASS. -->
<!-- Use a plain-English PR title that names the observable result, e.g. “Users can reconnect to their Bot without losing the conversation”. Include verified Linear and task keys when applicable: IPI-#### · TASK-ID — Plain-English outcome. Never invent task IDs. When improving an existing PR description, preserve its existing content, test evidence, and review summaries; add or clarify missing details without deleting them. -->

## 1. Purpose

**Purpose:** [What problem does this PR solve and why is it needed?]

**Expected outcome:** [What works better for the user or operator?]

**Do we need this?** [Yes / No / Optional — why this matters now; what happens without it.]

**Real-world example:** [User / admin] → [action] → [visible result; saved result if relevant].

**Issue / task:** [Verified GitHub issue or task link; otherwise N/A.]

**Type / tech stack:** [Runtime / Tests / Docs / Infrastructure] · [Only systems changed, e.g. React/Vite, Bun, Hono, CopilotKit, AG-UI, PostgreSQL, Tauri.]

**Production impact:** [Customer-facing change, developer/test tooling, documentation only, or infrastructure. Say whether a deployment is actually needed.]

## 2. Changes & Improvements

**Implemented**
<!-- For each important change, explain what it does, where it is used, and a practical benefit or example. -->
- [Main improvement]
- [Second improvement, if needed]
- [Third improvement, if needed]

**Existing functionality reused:** [Current component/API/service/DB operation and why.]

**Files to review:** [3–5 paths with what each reviewer should check.]

**How to reproduce:** [Exact user steps, local command or environment URL.]

**Risks / out of scope:** [Important limitations or N/A.]

**Non-goals:** [What this PR deliberately does not change.]

## 3. User Journey & Architecture

**User journey:** N/A — no affected user journey.

**Architecture / data flow:** N/A — no affected system flow.

<!-- Embed real Mermaid code blocks directly in the PR description for meaningful user journeys or architecture changes. Never leave placeholder diagrams visible or treat diagrams as test evidence. Replace the N/A defaults only when a flow changes. Use one diagram if sufficient; add an architecture, sequence or failure/recovery diagram when it explains something different. Verify actual components and saved results. For example, use the following format (replace all nodes with the real task-specific flow):

~~~mermaid
flowchart LR
  A[User action] ==> B[App] ==> C[Server or Bot] ==> D[Verified result]
~~~

Use a separate diagram if needed to show the real systems, data ownership or important failure paths. These hidden examples are instructions, not evidence. -->

## 4. Best Reference URLs

<!-- Only when useful: up to 3–5 exact, verified official docs, official GitHub repo paths or version-compatible examples. Read the source and say how it changes this task. Otherwise say N/A — existing code/tests sufficient. -->

| Reference URL | What matters | Exactly how to apply it |
| --- | --- | --- |
| [Exact official documentation / GitHub URL] | [Relevant API, version, example or contract] | [Specific implementation file, step or verification] |

<!-- For a reference that affects the implementation, name the exact feature, example, version or source file and the concrete change/test it enables. Use pinned GitHub references where version matters. Prefer current code, installed types and official examples over new custom code. No separate source-receipt table needed in PR bodies. -->

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

### Pre-merge test commands

[Only the exact commands needed for this PR, including required setup and expected results. Use the current repository scripts and CI workflow. Omit unrelated tests; do not report unrun commands as passed.]

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

**Production-ready success criteria (when runtime changes):** [The real user journey works, data and permissions are correct, relevant failure/retry tests pass, and the tested build has a safe release/recovery path. Mark N/A with a reason for docs/tests-only changes.]

**Merge decision:** NOT READY / READY — [Current-head evidence or blocker.]

## 8. Post-Merge Verification & Recovery

<!-- Plan before merge; check tasks only after executing them. Use N/A with a reason for irrelevant steps. -->
- [ ] **1. Verify merge:** Confirm merged SHA, intended files on `main` and relevant main CI.
- [ ] **2. Verify deployment:** Confirm affected server, web, desktop or mobile environments use the intended version, if deployed. Use the existing release workflow for the actual target. If hosted on Vercel, verify the deployment is ready and the live custom domain serves the merged commit (or a verified descendant); deploy/promote only if required by the existing process. For Docker/Kubernetes/desktop releases, verify the image/chart/package and running version instead. Never assume Vercel is configured; no manual release is needed for docs-only changes.
- [ ] **3. Verify database / config:** Check required migrations and API contracts. Avoid destructive production operations without explicit authorization and a recovery plan.
- [ ] **4. Test live result:** Check the affected feature, saved data, access rules, updates across servers and error handling when relevant. Start with read-only checks; writing tests need explicit authorization, safe test data and cleanup.
- [ ] **5. Fix failures:** Identify the root cause; make the smallest correction through the normal PR process, then retest and redeploy or roll back safely.
- [ ] **6. Update GitHub / task:** Record URLs, screenshots/logs, tested SHA, fixes and remaining work. Close only when acceptance criteria are proven.
- [ ] **7. Clean up:** Remove obsolete worktrees/branches only after ensuring no uncommitted or unrelated work is lost.

### Post-merge test commands & live proof

**Commands to run:** [Exact merged-main checks, deployment/version check and task-specific smoke tests. Include setup and expected results.]

**Live URLs:** [Actual deployment URL and live domain, or N/A with reason. Verify the correct version and the real affected feature; do not claim a successful release from an HTTP 200 alone.]

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
