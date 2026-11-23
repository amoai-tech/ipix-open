# iPix developer skills for OpenBot

Fifteen adapted skills from [iPix source](https://github.com/amoai-tech/ipixai/tree/main/.agents/skills) (initial ten based on commit `13bf2af385ebbe68a78c652daf5cffa3db95df24`). These are **developer-time instructions**, not runtime Bot tools or proof of a production Mastra/Planner integration.

**Added:** fashion-production, mastra, ipix-supabase, copilotkit, tasks, task-verifier, cloudinary, mermaid-diagrams, domain-modeling, qa-review, ipix-wireframe, **ponytail**, **refactor-plan**, **graphify**, **vercel-react-best-practices**.

**Preserved:** openbot-copy, openbot-data-access, openbot-screen-layout. The existing three remain authoritative for their respective OpenBot UI/behavior boundaries.

The source's extensive Next.js-specific references, long Graphify orchestration scripts, and 72-rule Vercel pack are intentionally not copied. Add only task-relevant, verified support material. `ipix-wireframe` includes one compact engineering checklist; `mermaid-diagrams` is improved in place, not duplicated.

**Additional routing:** `ponytail` picks the smallest safe change; `refactor-plan` plans multi-file migrations; `graphify` traces complex relationships; `vercel-react-best-practices` addresses measured React/Vite performance bottlenecks.

**Skill usage:** `ipix-wireframe` for buildable screen/UI contracts; `mermaid-diagrams` for the smallest meaningful cross-service diagram. They share a journey but do not replace implementation or approval verification.

Authoring: [Anthropic's skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices). Diagram syntax: [Mermaid](https://mermaid.js.org/intro/syntax-reference).

**Test prompts:** (1) Wireframe a campaign review on 390px mobile with missing fields; (2) Diagram rejected vs approved proposal without a tenant-auth bypass; (3) Plan a 24-shot fashion campaign; (4) Prove cross-organization access and double approval are rejected.
