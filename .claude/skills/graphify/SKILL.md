---
name: graphify
description: "Use to trace OpenBot/iPix cross-module code dependencies, callers, ownership and architecture; query a current Graphify index first, and build a new graph only if broad or repeated research justifies it."
---

# Graphify — source-backed architecture exploration

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/tree/main/.agents/skills/graphify

Graphify builds/query persistent knowledge graphs of code and documents. It is research context, **not** proof of runtime correctness.

## Fast path

1. For a precise file, function, or small bug, use targeted repository search and exact file reads before graph generation.
2. If `graphify-out/graph.json` already exists, check source scope/freshness and query it first (`graphify query`, `path`, `explain` if supported by the installed CLI).
3. For unfamiliar, cross-module or repeated research, inspect available Graphify plugin/CLI tools and their actual installed versions/help. **Do not assume** iPix's long Python workflow, subagent APIs, or installation commands are available.
4. Limit indexing to relevant paths. Exclude dependencies, generated files, secrets, credentials, customer content and unnecessary media. Never send private repo data to external models without authorization.
5. Label source-extracted edges versus inferred links, and verify each load-bearing link against current code and tests.
6. Return paths, key callers, source revisions, uncertainty, and one smallest next change.

## Example

To trace the Mastra bridge: locate `shared/harnesses.ts`, the registered agent creation flow, server authorization boundary, streaming integration and tests; verify each call edge in code before editing.

## Safety and verification

No implicit tool installs/upgrades, repository clones, background watcher, or committed `graphify-out` artifacts. Keep iPix's durable Supabase domain truth separate from OpenBot's own server/database. Provide source-backed findings and a targeted behavioral test.
