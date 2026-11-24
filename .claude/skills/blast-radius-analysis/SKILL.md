---
name: blast-radius-analysis
description: "Use when a small ipix-open code or contract change may break unrelated callers, generic Bots, persisted records, authorization, CI, streaming or other tenants. Prove the critical safety assumption with a focused real test, not a grep-only list."
---

# Blast-radius analysis — prove what else could break

A simple diff can affect clients and services the author did not open. Find the one or two **load-bearing facts** that make the change safe and test them through the actual code.

## Impact workflow

1. Start with the exact changed branch, diff and old/public behavior. Name both the **intended** consumer and unrelated consumers that must continue to work.
2. Discover dependent paths. Use Graphify only if `ipix-open` is actually indexed; otherwise start with local symbol/contract search, existing tests, generated OpenAPI consumers and installed dependency types. **A missing graph edge is not proof of no caller.**
3. Look beyond imports: persisted JSON/DB shape, cross-service permissions, generic OpenBot agent routing, browser/desktop/mobile consumers, streaming events, async retry and deployment topology.
4. State one or two falsifiable safety claims: e.g. "Only the dedicated fashion Planner receives tenant-specific tool grants" or "All old clients still parse the response." Find a focused script/integration/regression that fails if the claim is false.
5. Run that proof on a compatible test environment. Include an intentionally denied/old-client scenario when relevant, and inspect the runtime code path rather than accepting mocks alone.
6. Report **PASS / FAIL / NOT VERIFIED**, exact source/test and remaining uncertainty. If the decisive proof cannot be executed, block risky migration/merge instead of calling it safe. Do not confuse `task-verifier` Done judgment with this focused impact investigation.

**Example:** Updating Planner memory scoping might break all generic Mastra Bots. Prove the generic Bot has unchanged tools/credentials, that the dedicated Planner has tenant-scoped memory, and that cross-brand thread access fails under synthetic accounts.

## Sources → iPix application → proof

**Reference — ADAPT:** https://github.com/cursor/plugins/blob/005d8f6e8ec057b738adcd08a08b30db0478402d/pstack/skills/blast-radius/SKILL.md → identify the fact the change's safety relies on, then verify it with executed code. **Do not copy:** Cursor-only workflows, speculative semantic matches or unapproved data-writing probes. **Apply to:** this skill and narrow existing iPix test suites/CI; reuse `graphify` for navigation when available. **Verify:** a test that would fail if the claimed unaffected behavior broke.

**Reference — MODEL:** https://github.com/cursor/plugins/blob/005d8f6e8ec057b738adcd08a08b30db0478402d/pstack/skills/principle-test-behavior-not-implementation/SKILL.md → assert observable contract rather than private implementation call order. **Do not copy:** internal-specific test expectations. **Apply to:** exact PR contract regression tests. **Verify:** equivalent refactor stays green and a broken response/user effect turns red.

**STOP:** Unknown consumer, incompatible installed dependency, untested tenant boundary or unverified state migration means **NOT VERIFIED**. This developer skill never grants permission to modify production schemas or secrets.
