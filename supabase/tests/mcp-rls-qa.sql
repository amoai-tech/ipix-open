-- Disposable QA ONLY. Run with psql -X -v ON_ERROR_STOP=1 on the existing
-- ipixqa356 database. No deployment migration; all changes are rolled back.
-- SQL claims simulate policy evaluation, not signed OAuth or HTTP authentication.
-- References:
-- https://supabase.com/docs/guides/auth/oauth-server/token-security
-- https://www.postgresql.org/docs/17/sql-createpolicy.html
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '20s';
DO $$
BEGIN
  IF (SELECT count(*) FROM auth.users) <> 6
     OR EXISTS (SELECT 1 FROM auth.users WHERE email IS NULL OR email NOT LIKE '%@ipix.test')
     OR (SELECT count(*) FROM auth.users WHERE email IN
       ('ipi1084-editor-a@ipix.test', 'ipi1084-orgb@ipix.test')) <> 2
     OR EXISTS (SELECT 1 FROM public.campaigns)
     OR EXISTS (SELECT 1 FROM public.assets)
     OR EXISTS (SELECT 1 FROM public.shoots)
  THEN
    RAISE EXCEPTION 'Refusing non-matching disposable QA database';
  END IF;
END
$$;

CREATE TEMP TABLE ipix_mcp_qa ON COMMIT DROP AS
SELECT u.id AS actor, m.org_id AS org, b.id AS brand,
       gen_random_uuid() AS campaign, gen_random_uuid() AS asset,
       gen_random_uuid() AS shoot
FROM auth.users u
JOIN public.org_members m ON m.user_id = u.id
JOIN public.brands b ON b.org_id = m.org_id
JOIN public.profiles p ON p.id = u.id
WHERE u.email IN ('ipi1084-editor-a@ipix.test', 'ipi1084-orgb@ipix.test');

DO $$
BEGIN
  IF (SELECT count(*) FROM ipix_mcp_qa) <> 2
     OR (SELECT count(DISTINCT actor) FROM ipix_mcp_qa) <> 2
     OR (SELECT count(DISTINCT org) FROM ipix_mcp_qa) <> 2
  THEN
    RAISE EXCEPTION 'Expected two independent synthetic actors and brands';
  END IF;
END
$$;

INSERT INTO public.campaigns (id, org_id, brand_id, name)
SELECT campaign, org, brand, 'MCP QA campaign' FROM ipix_mcp_qa;
INSERT INTO public.shoots (id, designer_id, shoot_type, fashion_category, style_type, estimated_quote)
SELECT shoot, actor, 'photography', 'synthetic', 'synthetic', 100 FROM ipix_mcp_qa;
INSERT INTO public.assets (id, brand_id, shoot_id, url, asset_type, width, height)
SELECT asset, brand, shoot, 'https://example.invalid/mcp-qa-image', 'image', 100, 100 FROM ipix_mcp_qa;

-- Candidate only: deny all OAuth-client writes to the five tool tables, and
-- deny reads by unapproved clients. Existing first-party policies still apply.
-- The placeholder client/resource are exclusively SQL test values, not credentials.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['org_members','brands','campaigns','assets','shoots'] LOOP
    EXECUTE format(
      'CREATE POLICY ipix_qa_oauth_select ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (
         (SELECT auth.jwt()->>''client_id'') IS NULL OR
         ((SELECT auth.jwt()->>''client_id'') = ''ipix-qa-policy-client'' AND
          ((SELECT auth.jwt()->>''aud'') = ''https://example.invalid/mcp'' OR
           ((SELECT jsonb_typeof(auth.jwt()->''aud'')) = ''array'' AND
            (SELECT auth.jwt()->''aud'') @> ''["https://example.invalid/mcp"]''::jsonb AND
            NOT (SELECT jsonb_path_exists(auth.jwt()->''aud'', ''$[*] ? (@.type() != "string")''))))))', t);
    EXECUTE format(
      'CREATE POLICY ipix_qa_oauth_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((SELECT auth.jwt()->>''client_id'') IS NULL)', t);
    EXECUTE format(
      'CREATE POLICY ipix_qa_oauth_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING ((SELECT auth.jwt()->>''client_id'') IS NULL) WITH CHECK ((SELECT auth.jwt()->>''client_id'') IS NULL)', t);
    EXECUTE format(
      'CREATE POLICY ipix_qa_oauth_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING ((SELECT auth.jwt()->>''client_id'') IS NULL)', t);
  END LOOP;
END
$$;

GRANT SELECT ON ipix_mcp_qa TO authenticated;
SET LOCAL ROLE authenticated;
DO $$
DECLARE f record; mode text; n integer; denied boolean;
BEGIN
  FOR f IN SELECT * FROM ipix_mcp_qa LOOP
    FOREACH mode IN ARRAY ARRAY['first-party','approved','approved-array','unapproved','wrong-resource','wrong-resource-array','malformed-array'] LOOP
      PERFORM set_config('request.jwt.claims',
        (jsonb_build_object('sub',f.actor,'role','authenticated','aud',
          CASE mode
            WHEN 'wrong-resource' THEN to_jsonb('https://example.invalid/other'::text)
            WHEN 'first-party' THEN to_jsonb('authenticated'::text)
            WHEN 'approved-array' THEN '["authenticated","https://example.invalid/mcp"]'::jsonb
            WHEN 'wrong-resource-array' THEN '["authenticated","https://example.invalid/other"]'::jsonb
            WHEN 'malformed-array' THEN '["https://example.invalid/mcp",42]'::jsonb
            ELSE to_jsonb('https://example.invalid/mcp'::text) END)
          || CASE WHEN mode = 'first-party' THEN '{}'::jsonb
                  ELSE jsonb_build_object('client_id',CASE WHEN mode = 'unapproved'
                    THEN 'ipix-qa-other-client' ELSE 'ipix-qa-policy-client' END) END)::text,true);
      n := CASE WHEN mode IN ('first-party','approved','approved-array') THEN 1 ELSE 0 END;
      IF (SELECT count(*) FROM public.brands WHERE id IN (SELECT brand FROM ipix_mcp_qa)) <> n
        OR (SELECT count(*) FROM public.brands WHERE id = f.brand) <> n
        OR (SELECT count(*) FROM public.campaigns WHERE id IN (SELECT campaign FROM ipix_mcp_qa)) <> n
        OR (SELECT count(*) FROM public.campaigns WHERE id = f.campaign) <> n
        OR (SELECT count(*) FROM public.assets WHERE id IN (SELECT asset FROM ipix_mcp_qa)) <> n
        OR (SELECT count(*) FROM public.assets WHERE id = f.asset) <> n
        OR (SELECT count(*) FROM public.shoots WHERE id IN (SELECT shoot FROM ipix_mcp_qa)) <> n
        OR (SELECT count(*) FROM public.shoots WHERE id = f.shoot) <> n
        OR (SELECT count(*) FROM public.org_members WHERE user_id = f.actor) <> n
      THEN
        RAISE EXCEPTION 'Read visibility mismatch: %', mode;
      END IF;
      IF mode = 'first-party' THEN
        UPDATE public.assets SET width = width + 1 WHERE id = f.asset;
        GET DIAGNOSTICS n = ROW_COUNT;
        IF n <> 1 THEN RAISE EXCEPTION 'First-party asset update regressed'; END IF;
      ELSE
        UPDATE public.assets SET width = width + 1 WHERE id = f.asset;
        GET DIAGNOSTICS n = ROW_COUNT;
        IF n <> 0 THEN RAISE EXCEPTION 'OAuth asset update permitted'; END IF;
        DELETE FROM public.campaigns WHERE id = f.campaign;
        GET DIAGNOSTICS n = ROW_COUNT;
        IF n <> 0 THEN RAISE EXCEPTION 'OAuth campaign deletion permitted'; END IF;
        denied := false;
        BEGIN
          INSERT INTO public.campaigns(org_id, brand_id, name)
          VALUES (f.org, f.brand, 'MCP QA must deny');
        EXCEPTION WHEN insufficient_privilege THEN denied := true;
        END;
        IF NOT denied THEN RAISE EXCEPTION 'OAuth campaign insertion permitted'; END IF;
      END IF;
      RAISE NOTICE 'PASS: % read visibility and sampled write behavior',mode;
    END LOOP;
  END LOOP;
END
$$;
RESET ROLE;
ROLLBACK;
