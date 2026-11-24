# iPix developer skills in OpenBot

These are **developer-time Claude Code instructions**, not runtime Bot tools, deployed integrations, or evidence that the Planner works. Preserve OpenBot's three original skills: `openbot-copy` (user-facing wording), `openbot-data-access` (browser/server API), and `openbot-screen-layout` (configuration screens). Their contracts take priority over copied legacy examples.

## Architecture status and ownership

**Target direction, not deployed behavior:** [IPI-1489 architecture PR #3](https://github.com/amoai-tech/ipix-open/pull/3) directs a **standalone iPix application inside `ipix-open`**. At the 2026-11-23 review checkpoint PR #3 was unmerged; **recheck its current state and approved ADR before coding**, rather than assuming either that the migration exists or the PR is still pending. The old [`ipixai` repo](https://github.com/amoai-tech/ipixai) is a **COPY / ADAPT / REFERENCE ONLY migration source**, never a final runtime API or dependent service. Do not silently assume a proposed migration already exists.

| Responsibility | Target owner / guard |
| --- | --- |
| Browser, conversation, UI, developer skills | Existing OpenBot React/Vite + CopilotKit v2 entry points in `ipix-open` |
| Bundled generic Mastra harness and migrated Production Planner | Both stay in `ipix-open`; **dedicated Planner service preferred** to isolate tenant tools/credentials from shared `agent-mastra/` (reconcile PR #3 candidate first) |
| Workspace conversations and infrastructure | OpenBot Postgres/Intelligence, **separate** from iPix business data |
| Brands, shoots, assets, approvals, roles | Supabase Auth/Postgres with server authorization and RLS |
| Images and transformations | Cloudinary; authorized iPix metadata and brand links live in Supabase |
| Current production `ipixai` | Legacy running system remains untouched until a separately approved cutover |

**QA STOP:** Before any Planner call, select an approved *nonproduction* Supabase project with matching Auth issuer/audience, business database, and storage. Isolate **Mastra memory/workflow storage** and Cloudinary credentials too. Synthetic inputs alone do not prevent production memory writes. No actual customer data or existing production service keys in QA.

**Approval STOP:** AI proposes → human edits/reviews exact revision → server verifies current actor, tenant, resource, version and permission → one idempotent write → durable readback. Reauthorize on resume/retry; do not trust browser org/user/thread/run IDs, model text, OpenBot session alone, or a shared service token as the iPix actor.

**Source priority:** Current `ipix-open` main + installed package/types → live tests/runtime → pinned upstream documentation → owner-directed PR #3 (until merged) → legacy migration source. Record conflicts instead of quietly copying Next.js code.

## Skills and boundaries

The **15 adapted** skills are: `mastra`, `copilotkit`, `ipix-supabase`, `cloudinary`, `fashion-production`, `tasks`, `task-verifier`, `qa-review`, `domain-modeling`, `ipix-wireframe`, `mermaid-diagrams`, `ponytail`, `refactor-plan`, `graphify`, `vercel-react-best-practices`.

- **Planning:** `tasks` handles Linear/PR lifecycle; `refactor-plan` handles breaking migrations; `ponytail` checks whether new complexity is necessary; `graphify` traces broad dependencies.
- **Product/design:** `domain-modeling` defines terms; `fashion-production` specifies shoot deliverables; `ipix-wireframe` defines buildable screens; `mermaid-diagrams` models important states/boundaries.
- **Implementation:** `mastra` owns migrated Planner guidance; `copilotkit` owns interactive agent presentation; `ipix-supabase` owns auth/data rules; `cloudinary` owns media integration; `vercel-react-best-practices` optimizes measured React/Vite behavior.
- **Quality:** `qa-review` finds all evidence-backed risks and proposes up to five high-value tests; `task-verifier` independently proves applicable Done criteria.

Use the smallest relevant skill, and consult another only for a real cross-domain gap. Do not load every skill just because the request mentions iPix.

## Source and evaluation rules

- Inspect the **installed package and actual file** before using official examples. Every external implementation reference must map to the destination, COPY / ADAPT / REFERENCE ONLY, the incompatible part to avoid, and a test.
- Keep main `SKILL.md` small; load specific `references/` only when necessary. Do not copy huge Next.js guides or Graphify orchestration into this Vite/Bun repo.
- For a quick sketch do not load the full wireframe checklist; load it for implementation-ready handoffs.
- The [focused routing examples](evals/critical-routing.json) include should-trigger and near-miss should-not-trigger cases. They are **fixtures, not proof of real Claude activation**. Follow [the evaluation procedure](evals/README.md) before claiming a skill reliably activates or improves results.
- Authoring: [official Anthropic Skill Creator](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/skill-creator/skills/skill-creator/SKILL.md) and [Claude Code skills documentation](https://code.claude.com/docs/en/skills).
