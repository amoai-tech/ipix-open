---
name: ipix-supabase
description: "Use for migrating or reviewing Supabase Auth, RLS, brand tenancy, data ownership, QA project isolation, migrations and authorized iPix business reads/writes inside standalone ipix-open."
---

# Supabase — new iPix application's durable business truth

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/ipix-supabase/SKILL.md

Follow [architecture and QA STOP conditions](../README-ipix.md#architecture-status-and-ownership): `ipix-open` is target app; legacy `ipixai` code is migration input only. OpenBot's Postgres/Intelligence remains separate from Supabase business tables. Do not assume the identity bridge exists until inspected and tested.

## Authorization and data workflow

1. Identify data owner and true caller. OpenBot browser reads/writes through the generated OpenAPI client, existing `client` and TanStack Query factories per `openbot-data-access`; no direct browser service-role or ad hoc Supabase bypass.
2. Before tests or migrations, confirm a **dedicated nonproduction** Supabase project with matching Auth issuer/audience, publishable key, RLS data/storage, isolated Mastra memory and media. Stop on production or mismatched targets.
3. Select and prove a per-user credential handoff. At server boundary validate issuer, audience, signature and expiry, then **current** brand membership, role and resource ownership. OpenBot session, user metadata, model output and browser orgId are not Supabase business authority.
4. Reuse reviewed legacy schema/auth/business services as **ADAPT**, not a network dependency. Read schemas first; apply migrations only through the approved QA and deployment process.
5. Keep RLS enabled and test denied direct REST/RPC/storage access. Server business authorization remains required even when RLS exists.
6. For a consequential write, validate the exact human-approved artifact and revision at action time and inside an idempotent transaction; on retry/resume reauthorize and read back canonical data.

**Example:** Producer A enters Producer B's shoot ID after switching brands. The new application's authorized API refuses both a read and an approval, even if the identifier appears in the UI.

**Verify:** Synthetic A/B accounts; anonymous/expired/revoked access; QA issuer mismatch; wrong resource ID; duplicate approval=one record; reject=no record; readback after restart. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) · [Server Auth](https://supabase.com/docs/guides/auth/server-side).
