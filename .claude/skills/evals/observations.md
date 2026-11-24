# Limited live skill-selection observations — 2026-11-23

**Environment:** isolated `/home/sk/ipix-open-wt/ipi-1498-skills-review` worktree, base `04da42c6` plus the proposed uncommitted skill updates; Claude Code 2.1.331, `claude --print --verbose --output-format stream-json --no-session-persistence`. Read-only execution; edit, shell and network tools explicitly disallowed. Temporary event logs were kept outside Git and are not part of the PR.

| Scenario | Actual observed invocation | Outcome | Classification |
| --- | --- | --- | --- |
| Port the legacy fashion Production Planner into standalone OpenBot and identify auth/memory boundaries | `Skill({skill:"mastra", ...})` | Consulted repository; distinguished bundled Mastra harness from **not-yet-migrated** Planner, listed Supabase/QA memory proof | **PASS — positive routing smoke** |
| Edit generic prose in the bundled OpenBot `agent-mastra` example, *not* the Planner | No `Skill` invocation | Located `agent-mastra/src/mastra/index.ts` base instructions without misrouting to Planner migration | **PASS — near-miss routing smoke** |
| Audit documentation-only PR Done gates, N/A reasons and skill-activation evidence | `Skill({skill:"task-verifier", ...})` | Correctly distinguished static docs checks, unrelated runtime N/A and missing full activation proof | **PASS — positive routing smoke** |

**Limits:** This is 3 observed CLI smoke prompts for **two skills**, not 12/12 fixture execution, no old-skill/without-skill control, no variance or token/time benchmark, no real user/tenant flows, and no claim that the Planner was migrated. Remaining critical cases and baseline quality comparisons: **NOT VERIFIED**.

**Source and evaluator:** Follow [official Anthropic Skill Creator](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/skill-creator/skills/skill-creator/SKILL.md), compare with old/without-skill and record independent evidence before declaring behavioral certification. Production work still requires separate authorization and integration tests.
