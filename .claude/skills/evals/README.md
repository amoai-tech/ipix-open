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

## 4. Better skill comparisons — when evaluating quality claims

Use [pstack's blinded eval playbook](https://github.com/cursor/plugins/blob/005d8f6e8ec057b738adcd08a08b30db0478402d/pstack/skills/poteto-mode/playbooks/eval.md) as a **MODEL**, not a plugin or automatic background worker. **Do not copy:** its multi-model agent orchestration, Cursor-only CLI, cost assumptions, self-judging model scores or access to production data.

**Apply to:** a separate approved evaluation run for a proposed/new `SKILL.md` and its previous version or skill-absent baseline. Use the same model and tool permissions in isolated working directories; present the candidate with an organic task, not an obvious "test this skill" prompt. Keep judge rubric private from the candidate, blind output identity, and grade source correctness, safety, testability and useful result on concrete observations.

**Verify:** transcript shows the selected skills, correct answer, skipped/denied tool calls and negative near-miss. Record prompt, exact SHA, model/runtime, success criteria and costs only when measured. If the environment cannot invoke Claude or the result is not independently observed, mark **NOT VERIFIED**, not "100% accurate". Static fixture parsing does not prove activation.


## 5. Execute one safe with/without-skill routing comparison

**Reference — ADAPT:** https://github.com/anthropics/claude-plugins-official/blob/main/plugins/skill-creator/skills/skill-creator/SKILL.md → compare a real skill-enabled response to an independently prepared baseline. **Do not copy:** provider-specific background eval workers, unrestricted tools, private data or self-certified scores. **Apply to:** `run-routing-readonly.py` and one selected local fixture. **Verify:** actual observed `Skill` tool invocation in the candidate and no such invocation in baseline, with explicit quota/error handling.

The opt-in `run-routing-readonly.py` performs **one candidate and one baseline call** on the same prompt. Its output is metadata only and says nothing about response quality or whether the application works. It uses restricted mode, no MCP servers, permits only `Read`, `Glob`, `Grep` and `Skill` tools, forbids writes, commands and web tools, and does not save prompts, answers, tokens or session files. No API key or customer data belongs in the fixtures.

Prepare a separate disposable worktree from the **exact candidate SHA**, with no development secrets, and delete *only* the selected SKILL.md inside the disposable worktree. For example, from PR #13's checkout (which contains the evaluator and accessibility skill):

~~~sh
(
set -e
candidate="$(git rev-parse --show-toplevel)"
baseline="${TMPDIR:-/tmp}/ipix-a11y-baseline-$(git rev-parse --short HEAD)"
if test -e "$baseline"; then
  echo "Baseline already exists: $baseline; inspect it before retrying" >&2
  exit 1  # Exits only this subshell, never the user's interactive terminal
fi
git -C "$candidate" worktree add --detach "$baseline" HEAD
# Always restore and detach this disposable worktree, even if Claude is unavailable.
cleanup_baseline() {
  if test -d "$baseline"; then
    git -C "$baseline" restore .claude/skills/accessibility-audit/SKILL.md || true
    git -C "$candidate" worktree remove "$baseline" || {
      echo "Could not remove $baseline; inspect manually" >&2
    }
  fi
}
trap cleanup_baseline EXIT
rm "$baseline/.claude/skills/accessibility-audit/SKILL.md"
python3 "$candidate/.claude/skills/evals/run-routing-readonly.py" \
  --with-checkout "$candidate" --without-checkout "$baseline" \
  --fixture-file "$candidate/.claude/skills/evals/accessibility-routing.json" \
  --skill accessibility-audit --case-id a11y-real-ui --dry-run
# For a real comparison, remove --dry-run and add --model <exact-model-version>.
# The optional --timeout flag defaults to 300 seconds per model call.
# The EXIT trap cleans the baseline on PASS, FAIL, NOT VERIFIED or interruption.
)
~~~

Run one realistic positive and one close negative case for each new skill. **STOP and report NOT VERIFIED** on rate limits, no access, different SHAs, unsafe directories or unobserved tool events. Baseline/candidate must use the same model and permissions; score answer quality manually on correctness, security and source accuracy rather than treating a tool invocation as sufficient.
