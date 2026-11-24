---
name: security-threat-modeling
description: "Use for security review or design of ipix-open trust boundaries: Auth/session verification, tenant isolation, CopilotKit/Mastra tool grants, prompt injection, Cloudinary webhooks, secrets and privileged actions. Not for a generic RLS syntax question alone."
---

# Security threat modeling — show where trust changes

Use this **before** implementing or changing an input, permission, external service, tenant-specific agent or consequential write. This is a cross-stack threat map, not a second Supabase RLS manual.

## Threat-model workflow

1. Identify the actual asset and actor: producer, reviewer, service account, unrelated tenant or unauthenticated client. Confirm the **current** route and code exist in `ipix-open` before proposing a defense.
2. Draw the trust boundaries: browser/CopilotKit → authenticated application server → isolated fashion Planner → tenant-authorized Supabase/Postgres → media provider. Model text, user metadata, browser org IDs, headers, URLs and arbitrary thread/run IDs are **untrusted inputs**.
3. For each boundary ask: Who verifies identity? Who authorizes the **current** resource and action? What can an attacker substitute or replay? Can a generic OpenBot Bot inherit Planner-specific tools, credentials or memory? Check stored-data and outbound media/log visibility too.
4. Require a fail-closed server path: validate identity, membership/role, resource, revision, allowed tool and exact human-approved action. Revalidate on delayed resume, retry, duplicate event or cancellation. Use an idempotent durable save/readback.
5. Check direct routes and bypasses, not only the UI: RLS, RPC and storage policies where applicable, webhook signature/replay, SSRF in pasted URLs, untrusted retrieved content/prompt injection, sensitive logging, and least privilege of service tokens.
6. Rank verified exploit paths by impact and reachability. Propose the smallest fix and **negative** tests. Do not treat a theoretical STRIDE label, passing happy-path test or presence of `service_role` as authorization proof.
7. For actual Supabase SQL/RLS changes, defer to `ipix-supabase` and inspect the real nonproduction project first. For an actual approval journey defer to `task-verifier` for independent acceptance proof.

**Example:** A malicious brand reference page tells the Planner to upload all workspace assets externally. The text is input data, not instructions; no outbound privileged tool is granted. A direct attempt with Brand B's asset ID receives denial and leaves no writes.

## Sources and destination

**Reference — ADAPT:** https://github.com/addyosmani/agent-skills/blob/8c99fa36d90068c82d547f7c12a9d67a3e95f4ee/skills/security-and-hardening/SKILL.md → threat-model-first and trust-boundary analysis. **Do not copy:** broad generic checklists or vendor config changes as substitutes for actual access control. **Apply to:** this iPix developer skill, then the specific affected server/agent tool in its own task. **Verify:** denied direct request and trace of exact server authorization decision.

**Reference — REFERENCE ONLY:** https://supabase.com/docs/guides/database/postgres/row-level-security → row-level access behavior. **Do not copy:** blanket `TO authenticated` policies that omit tenant ownership. **Apply to:** existing `ipix-supabase` skill when SQL changes are actually in scope. **Verify:** isolated QA users A/B, direct REST/RPC denial and readback.

**STOP:** No signed-in QA identity, unmatched issuer/project, unclear server caller or agent shared-secret boundary means security **NOT VERIFIED**. Never use production customer data, real cross-tenant identifiers or privileged write probes without approval.
