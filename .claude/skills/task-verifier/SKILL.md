---
name: task-verifier
description: "Use for independent, evidence-backed completion checks of OpenBot/iPix tasks and PRs, distinguishing documentation-only gates from authenticated runtime, tenant security, exact approval and persistence proof."
---

# Task Verifier — independent Done decision

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/task-verifier/SKILL.md

Use [the current standalone ownership contract](../README-ipix.md#architecture-status-and-ownership), actual branch/installed types, live Linear acceptance criteria, and exact PR head. Reopen claims; a reviewer comment, screenshot, or prior chat is not proof by itself.

## Quick before changes

Inspect current diff, active PRs and acceptance criteria. If the alleged gap is fixed already, report why instead of duplicating work.

## Full before Done

**Applicability:** Identify what behavior this change touches. For an unaffected gate, explicitly record **N/A — why**; it does not block completion. If the change touches a **consequential action**, the following are **mandatory, never N/A**: exact human approval, tenant isolation, exactly-once durable persistence and retry safety. On changes affecting agent run lifecycle, also test Stop, stream error and resume/recovery.

1. **Source:** Exact source diff, version, dependencies and requirement match; no hidden unrelated changes.
2. **Static/targeted:** Cheapest decisive test first → focused Bun tests → types/build if applicable. Record exact commands/results.
3. **Integration:** For affected runtime flows, prove authenticated request, authorization, status/error handling and API response.
4. **Negative security:** For applicable writes verify wrong organization, stale/rejected approval, double-click/retry, revocation and direct bypass.
5. **User journey:** Where applicable, run signed-in browser or API scenario; confirm actual canonical readback, not just a toast or mock.
6. **Audit:** Record PASS / FAIL / NOT VERIFIED / N/A-with-reason for each applicable gate, with head SHA and evidence. **FAIL or NOT VERIFIED** on a required gate prevents Done.

## Examples

- Documentation-only PR: correct links/frontmatter and skill descriptions PASS; business RLS write test **N/A — no runtime write change**. **Real skill-activation certification** remains NOT VERIFIED until a real run.
- Shoot approval PR: user edits draft, rejects one option and approves exact remaining revision; cross-brand denial and double-submit=one saved record are mandatory.

**Do not conflate:** QA Review finds possible merge risks; Task Verifier independently proves whether defined acceptance criteria are satisfied.
