---
name: ipix-supabase
description: Use for Supabase schema, auth, RLS, migrations, trusted tenancy and safe iPix data access from OpenBot.
---

# Ipix Supabase — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/ipix-supabase/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Database and authorization
1. Determine whether data belongs to OpenBot or iPix. Supabase is iPix's durable domain truth, not a replacement for OpenBot's own database.
2. For OpenBot browser data use its generated OpenAPI client and query/mutation factories via `openbot-data-access`; never add ad hoc direct browser Supabase calls.
3. Use iPix's authenticated server/API/RPC path. Verify membership, role and requested resource server-side; RLS is defense in depth.
4. Inspect schemas and migrations read-only first. Implement schema changes as reviewed migrations tested in preview, not manual production SQL.
5. Preserve draft → operator approval → exact server validation → idempotent commit → read-back.
6. Never copy service-role keys, connection strings or secrets into source, skills or browser bundles.
## Example
A user changes a shoot ID to another brand's shoot: the server denies access even if OpenBot displayed that identifier.
## Verify
Two-org identity tests, anonymous denial, expired session, write grants, RLS, duplicate approval and rollback. Official: https://supabase.com/docs/guides/database/postgres/row-level-security
