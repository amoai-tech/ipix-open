---
name: cloudinary
description: Use for authorized iPix media uploads, Cloudinary images, transformations, metadata ownership and asset delivery in OpenBot.
---

# Cloudinary — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/cloudinary/SKILL.md

## OpenBot boundaries
- Inspect the current Bun monorepo, installed packages and relevant existing OpenBot code first. Do not copy iPix Next.js routes, paths, transport, environment secrets, or deployment assumptions.
- Keep `openbot-copy`, `openbot-data-access`, and `openbot-screen-layout` authoritative for user-facing copy, browser API operations and configuration-screen layout.
- iPix owns domain data in Supabase and its Mastra Planner; OpenBot connects through its supported authenticated agent/API interfaces.
- Never trust a browser-supplied organization, user, thread or run ID as authorization. Human approval plus server-side revalidation and idempotent execution are mandatory for consequential actions.

## Media boundary
1. Identify whether the Bot needs an existing image preview or a real upload/transform workflow; don't replace OpenBot's file system.
2. Cloudinary owns bytes and transformations; iPix Supabase owns asset identity, brand/shoot linkage and approval status.
3. Reuse existing iPix server-side signed upload/delivery utilities. A public ID or URL is not authorization.
4. Keep secrets server-side and show only appropriately authorized asset URLs.
5. Require human approval for commerce linking, publishing or irreversible media operations. Verify SDK version and https://cloudinary.com/documentation.
## Example
Show approved campaign images to the authorized brand while hiding Org B's image records.
## Verify
Signature expiry, tenant denial, stable metadata, retry/duplicate upload behavior and rejected asset handling.
