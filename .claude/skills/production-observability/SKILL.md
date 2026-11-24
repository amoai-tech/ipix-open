---
name: production-observability
description: "Use when planning or reviewing logs, traces, metrics, alerts or failure recovery for ipix-open CopilotKit, Mastra, authenticated APIs, Cloudinary and Supabase; start from real operational questions, not generic logging or an active bug diagnosis."
---

# Production observability — prove where a request failed

**Outcome:** An operator can tell whether an authorized request reached the expected service, failed, retried or saved — without exposing a customer's data. This is **developer guidance**, not an installed monitoring service.

## Build from questions, not from a logging vendor

1. Identify the business question: "Why did this synthetic brand shoot fail?" or "Was an approved save executed twice?" Name the user-visible failure and what reliable signal would answer it.
2. Inspect current OpenBot logging/tracing/testing libraries and the runtime path before adding any instrumentation. Use existing request IDs and error tracking first; do not add Sentry, OpenTelemetry, another database or custom trace SDK merely because they appear in examples.
3. Trace a request using **bounded, pseudonymous identifiers** where authorized: browser/CopilotKit request → server identity/tool decision → dedicated iPix Planner → QA Supabase/media service → canonical persisted result. Distinguish model proposal, user approval and successful write.
4. Record structured outcomes, service names, durations, failure categories, retry attempt and authorization decision. Strip secrets, bearer tokens, unredacted prompt bodies, full product image URLs, personal identifiers and full third-party responses.
5. Pair logs with a small useful metric (failed requests, retry rate, elapsed time) and one alert that means an operator can act. Avoid noisy alerts based solely on health probes or a generic count of AI errors.
6. **Verify telemetry itself** in nonproduction: reproduce one expected success and one denied/failure path; confirm logs identify the right request, contain no secrets and prove *readback* rather than an optimistic UI toast.
7. For live incidents, use `root-cause-debugging` to reproduce and fix the current defect. This skill designs the future evidence and operational runbook.

**Example:** A product-image upload completes at Cloudinary but no corresponding approved asset appears in iPix. The trace points to the authorized DB-link failure; the dashboard reports a pending reconciliation instead of falsely counting a completed asset.

## Sources → iPix application → proof

**Reference — ADAPT:** https://github.com/addyosmani/agent-skills/blob/8c99fa36d90068c82d547f7c12a9d67a3e95f4ee/skills/observability-and-instrumentation/SKILL.md → question-first logs, metrics, tracing, alert runbooks and telemetry tests. **Do not copy:** vendor-specific bootstrap, arbitrary high-cardinality labels or a separate observability stack. **Apply to:** this skill, then the actual installed `ipix-open` server modules only when a runtime instrumentation task is approved. **Verify:** structured success/failure trace in authorized QA.

**Reference — REFERENCE ONLY:** https://mastra.ai/docs/observability/overview → native agent tracing options, subject to installed version check before using an API. **Do not copy:** unverified newer methods or raw model output into logs. **Apply to:** isolated iPix Planner when it exists, not the generic shared OpenBot harness. **Verify:** per-request trace without leaking tenant context.

**STOP:** If metrics cannot be tied to a known actor/request and a safe environment, mark **NOT VERIFIED**; do not switch on full payload logging or create production alerts in a documentation PR.
