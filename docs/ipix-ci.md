# iPix OpenBot CI — web-first development

The iPix fork uses standard GitHub-hosted runners. The inherited CopilotKit
larger-runner labels are not required. Native desktop code remains supported,
but packaging and release operations do not run on ordinary web PRs.

| Work | Automatic policy | On demand / release |
| --- | --- | --- |
| Core CI | PRs and main; existing change detection, tests, builds, API, browser and verification | full-ci label for component Dockerfiles; release checks remain |
| Security scanning | Workflow/action changes and the existing security schedule | Existing security workflows remain |
| Desktop | Linux native regression and existing Docker live tests when desktop inputs change, including shared harness catalogue | Desktop → Run workflow for complete Mac, Windows and Linux installers |
| Desktop upgrade | No automatic PR or nightly run | Desktop upgrade → Run workflow; previous release by default, full release window optional |
| Model lock | Same-repository PRs with model/client or compatibility implementation/lock changes; workflow-only edits do not invoke model providers | Existing local model-compat CLI; no new provider credentials |
| macOS signing | Release tags only | Explicit dispatch, protected signing environment |
| Windows signing | No ordinary PR run | Release workflow dispatch or explicit dispatch, protected signing environment |
| Contributor scheduling, upstream model refresh and downloads sync | No scheduled runs | Files remain; upstream-only repository guards stay in place |

## References mapped to changes

- [GitHub hosted runner labels](https://docs.github.com/en/actions/reference/runners/github-hosted-runners):
  use ubuntu-latest, windows-latest/windows-2025, macOS labels and the existing
  Arm64 runner in workflow runner fields. Do not copy organization-specific runner names.
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax):
  use workflow_dispatch for manual desktop upgrade and packaging; keep release
  reusable workflows and signing environments. Do not add secret-bearing PR triggers.
- [Concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency):
  CI and Desktop group by workflow and PR ref, or main commit; a new PR push
  cancels its own obsolete run without cancelling a different PR.

## Release and review gates

- Confirm the current-head CI verify check actually runs on a standard runner.
- For desktop inputs, confirm native core and applicable live jobs ran; a skipped
  package build is intentional, not proof of macOS/Windows installer compatibility.
- Before shipping a desktop release, explicitly run the applicable upgrade and
  all-platform packaging checks, then retain the protected signing flow. Inspect
  the previous-release test output: no available earlier release is not a tested upgrade.
- For model changes, verify selected engines and actual provider calls; missing
  provider secrets are skipped, not evidence of compatibility.
- For Dockerfile changes request full-ci and verify the component build job.
- Existing queued runs retain their old workflow definitions. After merge, review
  obsolete queued runs before cancelling or rerunning on a new commit.
- Require CI / verify in repository branch rules when the new checks are green.
  No branch protection, secrets, billing settings or deployed application state
  are changed by this PR.

Rollback: revert the workflow PR. Reverting restores the previous trigger policy
and runner labels, which must be available before restarting old checks.
