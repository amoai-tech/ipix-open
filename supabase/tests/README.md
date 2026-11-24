# iPix custom MCP — disposable RLS regression

This test models candidate OAuth restrictions in PostgreSQL, not a release migration.
Run it only against the existing synthetic `ipixqa356` stack. Never point it at a
hosted database or use customer records. It refuses a database without the exact
synthetic user count, two expected actors, and empty campaign/asset/legacy-shoot
tables. The transaction rolls back all fixture data and temporary policies, even
if psql exits after an assertion failure.

From the repo root:

```sh
docker exec -i supabase_db_ipixqa356 psql -U postgres -d postgres -X -v ON_ERROR_STOP=1 -P pager=off < supabase/tests/mcp-rls-qa.sql
```

Expect eight PASS notices and ROLLBACK. Verify fixture tables are empty and no
policies named `ipix_qa_oauth_*` remain. Each actor gets a synthetic campaign,
legacy shoot booking, and asset; existing brands establish the organization.
Both actors exercise first-party, approved-client, unapproved-client, and
wrong-resource claims. Tests compare expected visible rows, deny sampled writes
for OAuth clients and preserve an existing first-party asset update.

## Reference and boundaries

- ADAPT: https://supabase.com/docs/guides/auth/oauth-server/token-security —
  client-aware RLS and documented SQL claim testing. Apply to
  `mcp-rls-qa.sql`; no signed tokens are minted or verified.
- ADAPT: https://www.postgresql.org/docs/17/sql-createpolicy.html —
  restrictive policies combine with existing permissive policies. Do not add an
  extra permissive policy that broadens access. All candidate policies roll back.
- COPY: https://github.com/denoland/setup-deno/blob/22d081ff2d3a40755e97629de92e3bcbfa7cf2ed/action.yml —
  pinned official Deno installer in `.github/workflows/ci.yml`, Deno 2.9.8,
  existing frozen check and offline MCP contract. No credentials or hosted DB.

## Release gates still open

The SQL test does not establish real issuer compatibility, a signed OAuth
session, direct HTTP Data API behavior, column-level projection restrictions,
revocation, exposed RPC/view/storage isolation, or canonical Planner shoots
(`public.shoots` is the legacy booking table). The simulated client and audience
are test-only values, not deployment settings. A real OAuth token has ordinary
database privileges unless separately constrained. Before a reviewed migration,
inventory all reachable tables, columns, functions, grants, and existing clients;
prove ordinary app behavior and deny unnecessary direct API access. RLS does not
govern TRUNCATE. Never run this candidate as a production migration. Preserve
exact resource validation in the MCP handler; do not bypass it to unblock QA.
