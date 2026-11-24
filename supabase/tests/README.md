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

Expect fourteen PASS notices and ROLLBACK. Verify fixture tables are empty and no
policies named `ipix_qa_oauth_*` remain. Each actor gets a synthetic campaign,
legacy shoot booking, and asset; existing brands establish the organization.
Both actors exercise first-party, approved-client, unapproved-client, and
wrong-resource claims, including string and array audiences and malformed arrays. Tests compare expected visible rows, deny sampled writes
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

## Signed OAuth browser gate

Run the existing local-only `scripts/ipix-qa-oauth-browser.mjs` from this
worktree after starting the QA consent UI at http://127.0.0.1:4175 and supplying
the approved fixture environment (SUPABASE_URL=http://127.0.0.1:56121,
SUPABASE_PUBLISHABLE_KEY, IPIX_QA_FIXTURE_PASSWORD). Do not commit or print
credentials. The script now requires separate browser contexts for both users,
initial issuance and refresh, rejection of a changed resource, and signature-
verified MCP calls with each initial/refreshed token. Negative-only Deno mode
is explicitly not OAuth certification. In full mode, missing either actor's
token or refresh token fails the test. The direct API and nonempty campaign,
asset and shoot HTTP test gates still remain separate.

- ADAPT: https://supabase.com/docs/guides/auth/oauth-server/oauth-flows —
  public-client refresh request, without a resource parameter; test that the
  original audience survives. Use the actual QA issuer, never a fabricated JWT.
- REFERENCE ONLY: https://github.com/supabase/auth/pull/2894 —
  proposed resource-indicator tests preserve the existing authenticated audience
  and add the resource as an array member. Match that behavior in the disposable
  SQL candidate; test wrong-resource and mixed-type arrays. The change is not a
  published issuer release and must not be treated as production support.

## QA direct access inventory (2026-11-24)

Read-only catalog inspection: PostgREST exposes public and graphql_public.
Public has 85 tables; storage has 12. No authenticated-readable table in those
two schemas lacks RLS. Both readable public views use security_invoker=true.
There are 39 public security-definer functions executable by authenticated
users (a review population, not 39 proven vulnerabilities). No storage policy
predicate directly references client_id. Review indirect helper checks and the
actual API surface before release. Do not blanket-revoke existing app privileges
without first-party regression evidence.

## Review hardening

- ADAPT: https://supabase.com/docs/reference/server/types-withsupabaseconfig —
  pass the trusted issuer explicitly to the installed @supabase/server 1.9.0
  verifier in handler.ts and advertise the same issuer in discovery. Use
  MCP_AUTH_ISSUER or the trusted project URL, not request headers. The offline
  oauth-challenge.deno.ts contract uses an ephemeral test-only ES256 key and
  rejects missing/wrong issuers; no live issuer support is implied.
- ADAPT: https://react.dev/learn/synchronizing-with-effects — invalidate stale
  asynchronous completions in use-oauth-consent.ts. Each committed authorization
  owns its pending decision; stale success/error/throw cannot redirect or unlock
  a newer decision. Already submitted server decisions are not canceled.
- REFERENCE ONLY: QA catalog inspection confirms legacy public.shoots has
  designer_id and no org_id, with SELECT RLS auth.uid() = designer_id. Keep
  the explicitly personal booking scope; canonical organization-owned Planner
  reads remain a separate release gate.

Callable RPC follow-up: the local catalog lists 39 authenticated-executable
public security-definer functions, including approval, booking, Planner and
asset mutation functions. Their source has no direct client_id reference; this
is a static screening result, not proof of authorization bypass. No storage
policies are present in this local QA schema. Test indirect helper enforcement,
actual HTTP access, and hosted storage separately. Do not deploy the candidate
RLS changes or grant additional privileges to work around missing issuer support.

## Direct RPC and column boundary regression

Run only on the existing disposable fixture database, from this worktree:

```sh
docker exec -i supabase_db_ipixqa356 psql -U postgres -d postgres -X -v ON_ERROR_STOP=1 -P pager=off < supabase/tests/mcp-rpc-qa.sql
```

Both synthetic actors demonstrate the existing authorization gap: the callable
`get_or_create_shortlist` function permits own-organization creation despite
an MCP client claim, while foreign-organization creation is denied. Both can
also read own-brand fields outside the MCP projection. No field values are
printed. The rollback-only candidate guard denies the test MCP client before
the existing RPC body and permits first-party creation for both actors. The
test verifies exactly two synthetic first-party creations, then rolls back all
data and the temporary function definition. It is not a production migration,
a signed OAuth proof, or a claim that the other RPCs have been fixed.

- ADAPT: https://supabase.com/docs/guides/auth/oauth-server/token-security —
  use trusted client_id at authorization boundaries, preserving existing
  organization checks; do not change other clients without an inventory.
- REFERENCE ONLY: https://supabase.com/docs/guides/api/securing-your-api —
  function execution needs its own authorization; a PostgREST pre-request
  check is not a universal Storage/Realtime/other-service boundary.
- REFERENCE ONLY: https://supabase.com/docs/guides/database/postgres/column-level-security —
  RLS is a row boundary, not a projection boundary. A table-level SELECT grant
  cannot be narrowed merely by revoking a single column grant.

Next release design checkpoint: choose a reviewed least-privilege data access
boundary that enforces the approved MCP client, permitted columns and
operations without weakening the ordinary application. Evaluate restricted
database privileges or narrow API views/functions using existing Supabase
facilities before adding infrastructure. Prove all exposed RPCs, REST and
GraphQL surfaces, and hosted Storage independently. Do not deploy a global
revoke or the test-only function rewrite. Keep the existing resource-bound
issuer requirement. The issuer and data authorization gates are independent.
