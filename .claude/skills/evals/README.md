# iPix Open developer-skill evaluation plan

[Critical routing fixtures](critical-routing.json) are **not executed Claude behavior tests**. They define realistic positive and near-miss negative prompts plus expected observations. Use them to test the actual Claude Code environment at the **exact PR head**.

## 1. Static contract (fast, repeatable)

From repository root: `bun test tests/ipix-skill-contract.test.ts`.

This checks metadata YAML, names, local links, file length, and eval-fixture structure. A green test does **not** prove Claude selects the right skill.

## 2. Actual activation and outcome (required to certify)

Follow [Anthropic's official Skill Creator](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/skill-creator/skills/skill-creator/SKILL.md) for real runs. Start with one realistic should-trigger and one near-miss should-not-trigger case per critical skill, then expand to additional phrasings and baseline comparisons. Do **not** use customer data, production access, real credentials or deploy/write tools in these evaluations.

For each fixture, in an isolated disposable checkout and with *read-only* tools:

1. Run the same substantive prompt with the **new skill** loaded and record which `Skill` was actually invoked, files consulted, answer and warnings.
2. Run the same prompt **without the skill** (or with the previous version) as baseline. Keep models/tool availability consistent.
3. Judge the exact expected outcome: right repository/architecture, relevant source use, no invented API/authorization, sensible tests.
4. Repeat ambiguous/near-miss prompts. A generic Mastra-harness edit must **not** misroute to the migrated Planner skill; a simple typo fix must not automatically load Ponytail.
5. Record PASS / FAIL / NOT VERIFIED for **routing**, **output quality**, **safety**, plus token/time only when measured. Keep transcripts redacted; never add keys or personal data to Git.

**STOP:** If the Claude CLI isn't authenticated, tool invocation cannot be observed, or test environment is unsafe, record NOT VERIFIED. Do not replace this with a keyword matcher or count static YAML parsing as activation proof.

**Observed limited smoke runs:** [observations.md](observations.md). They are read-only CLI checks, not independent with/without-skill benchmarks.

## 3. Release gate

Before calling the collection *behaviorally certified*: verify the critical skills (`mastra`, `copilotkit`, `ipix-supabase`, `task-verifier`, `qa-review`, `ponytail`) on correct **and wrong** requests, plus an OpenBot original-skill regression. A docs-only PR can pass its applicable static gates without claiming runtime skills or production integration have been validated.
