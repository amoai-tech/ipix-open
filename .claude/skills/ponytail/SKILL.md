---
name: ponytail
description: "Use when deciding whether a proposed OpenBot implementation, abstraction, or dependency is needed versus reusing existing code; or when explicitly asked for YAGNI, the smallest safe fix, or less boilerplate."
---

# Ponytail — smallest safe working change

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/tree/main/.agents/skills/ponytail

Understand the task, existing implementation, callers, and failure first. Lazy means **efficient, not careless**.

## Stop at the first rung that works

1. Does the change need to exist? Skip speculative work (YAGNI).
2. Does an existing OpenBot function, component, API, test or pattern solve it? Reuse it.
3. Does standard JavaScript, React, Bun, browser, CSS or a database constraint solve it natively?
4. Does an installed dependency solve it without adding another?
5. Can a small local edit solve it correctly?
6. Only then add the minimum custom implementation.

For bugs, trace callers and fix the **root cause** at the shared layer rather than patching each symptom. Deletion is preferable to addition when it preserves behavior.

## OpenBot guardrails

- OpenBot is a Bun/React/Vite application, not iPix Next.js. Respect `openbot-data-access`, `openbot-screen-layout` and `openbot-copy`.
- Reuse the native Mastra/AG-UI **pattern**, but do not place iPix tenant tools, secrets or permissions in the generic shared `agent-mastra` Bot. Prefer a narrowly isolated Planner service **inside this repo**; do not invent a second unrelated API client, business database or run registry.
- Never cut tenant authorization, exact human review, idempotent writes, data-loss safeguards, error recovery, accessibility or mandatory evidence.
- `tasks` owns workflow and proof; domain skills own domain correctness.

## Real-world example

An admin needs a new settings screen: reuse OpenBot's `PageShell`, existing form patterns and entity mutation factory instead of introducing a new UI library or direct browser `fetch`.

## Verify

For non-trivial logic, leave at least one decisive regression test. For risky actions, prove server authorization and durable readback. Report what was reused or skipped and why. A tiny wrong fix is not efficient.
