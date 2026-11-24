-- Disposable ipixqa356 only. Test existing authorization and a candidate guard.
-- Simulated claims, not signed OAuth or HTTP. No persistent changes.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '20s';
DO $$
BEGIN
  IF (SELECT count(*) FROM auth.users) <> 6
     OR EXISTS (SELECT 1 FROM auth.users WHERE email IS NULL OR email NOT LIKE '%@ipix.test')
     OR EXISTS (SELECT 1 FROM talent.talent_shortlists)
  THEN
    RAISE EXCEPTION 'Refusing non-matching disposable QA database';
  END IF;
END
$$;
CREATE TEMP TABLE ipix_mcp_rpc_qa ON COMMIT DROP AS
SELECT u.id AS actor, m.org_id AS org
FROM auth.users u JOIN public.org_members m ON m.user_id = u.id
WHERE u.email IN ('ipi1084-editor-a@ipix.test', 'ipi1084-orgb@ipix.test');
DO $$
BEGIN
  IF (SELECT count(*) FROM ipix_mcp_rpc_qa) <> 2
     OR (SELECT count(DISTINCT actor) FROM ipix_mcp_rpc_qa) <> 2
     OR (SELECT count(DISTINCT org) FROM ipix_mcp_rpc_qa) <> 2
  THEN
    RAISE EXCEPTION 'Expected independent synthetic actors';
  END IF;
END
$$;
GRANT SELECT ON ipix_mcp_rpc_qa TO authenticated;
SET LOCAL ROLE authenticated;
DO $$
DECLARE f record; result uuid; denied boolean;
BEGIN
  FOR f IN SELECT * FROM ipix_mcp_rpc_qa LOOP
    PERFORM set_config('request.jwt.claims',
      jsonb_build_object('sub', f.actor, 'role', 'authenticated',
        'client_id', 'ipix-qa-policy-client',
        'aud', jsonb_build_array('authenticated', 'https://example.invalid/mcp'))::text, true);
    -- Existing own-organization operation only, on an empty synthetic database.
    result := public.get_or_create_shortlist(f.org);
    IF result IS NULL THEN RAISE EXCEPTION 'Unexpected baseline RPC result'; END IF;
    denied := false;
    BEGIN
      PERFORM public.get_or_create_shortlist((SELECT org FROM ipix_mcp_rpc_qa WHERE actor <> f.actor));
    EXCEPTION WHEN raise_exception THEN
      IF SQLERRM <> 'not a member of this organization' THEN RAISE; END IF;
      denied := true;
    END;
    IF NOT denied THEN RAISE EXCEPTION 'Unexpected foreign shortlist access'; END IF;
    -- Summary-only MCP projection is not a database column permission boundary.
    -- Read the synthetic row without displaying field values.
    PERFORM ai_profile_draft, analysis_lock_token FROM public.brands WHERE org_id = f.org;
    IF NOT FOUND THEN RAISE EXCEPTION 'Expected own synthetic brand'; END IF;
    RAISE NOTICE 'BASELINE: own mutation and extra brand fields accessible; foreign organization denied';
  END LOOP;
END
$$;
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM talent.talent_shortlists) <> 2 THEN
    RAISE EXCEPTION 'Expected two synthetic shortlist records';
  END IF;
END
$$;
-- Remove only the two records created by the baseline, so first-party
-- success below must create new records, not just return existing ones.
DELETE FROM talent.talent_shortlists
WHERE owner_org_id IN (SELECT org FROM ipix_mcp_rpc_qa);
-- Candidate guard on this one RPC only: reuse its existing implementation,
-- preserve signature, owner, ACL and search_path. Reject the test-only MCP client.
-- This is a test hypothesis, NOT an approved migration or universal policy.
DO $$
DECLARE definition text;
BEGIN
  SELECT pg_get_functiondef('public.get_or_create_shortlist(uuid)'::regprocedure)
  INTO definition;
  IF position(E'\nbegin\n' IN definition) = 0 THEN
    RAISE EXCEPTION 'RPC definition changed; review before testing';
  END IF;
  EXECUTE replace(definition, E'\nbegin\n',
    E'\nbegin\n  if (select auth.jwt()->>''client_id'') = ''ipix-qa-policy-client'' then\n    raise exception using errcode = ''42501'', message = ''OAuth client cannot modify shortlists'';\n  end if;\n');
END
$$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE f record; denied boolean;
BEGIN
  FOR f IN SELECT * FROM ipix_mcp_rpc_qa LOOP
    PERFORM set_config('request.jwt.claims',
      jsonb_build_object('sub', f.actor, 'role', 'authenticated',
        'client_id', 'ipix-qa-policy-client',
        'aud', jsonb_build_array('authenticated', 'https://example.invalid/mcp'))::text, true);
    denied := false;
    BEGIN
      PERFORM public.get_or_create_shortlist(f.org);
    EXCEPTION WHEN insufficient_privilege THEN
      IF SQLERRM <> 'OAuth client cannot modify shortlists' THEN RAISE; END IF;
      denied := true;
    END;
    IF NOT denied THEN RAISE EXCEPTION 'Candidate OAuth RPC guard failed'; END IF;
    PERFORM set_config('request.jwt.claims',
      jsonb_build_object('sub', f.actor, 'role', 'authenticated', 'aud', 'authenticated')::text, true);
    IF public.get_or_create_shortlist(f.org) IS NULL THEN
      RAISE EXCEPTION 'First-party shortlist behavior regressed';
    END IF;
    RAISE NOTICE 'PASS: candidate blocks OAuth RPC and preserves first-party behavior';
  END LOOP;
END
$$;
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM talent.talent_shortlists) <> 2 THEN
    RAISE EXCEPTION 'Expected two first-party shortlist creations';
  END IF;
END
$$;
ROLLBACK;
