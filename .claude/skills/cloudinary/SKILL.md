---
name: cloudinary
description: Use for authorized iPix media uploads, Cloudinary images, transformations, metadata ownership and asset delivery in OpenBot.
---

# Cloudinary — iPix → OpenBot

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/blob/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills/cloudinary/SKILL.md

## OpenBot boundaries
- Follow [standalone iPix Open ownership](../README-ipix.md#architecture-status-and-ownership). The legacy `ipixai` repository supplies **migration references, not final live APIs**; architecture PR #3 is still unmerged.
- Verify installed Bun/React/Vite code first. Respect the original `openbot-copy`, `openbot-data-access` and `openbot-screen-layout` skills. Do not copy old Next.js routes, secrets, or transports.
- Never use browser/model org, user, thread or run IDs as authority. Consequential actions require exact human approval, server-side tenant checks and idempotent durable readback.

## Media boundary
1. Identify whether the Bot needs an existing image preview or a real upload/transform workflow; don't replace OpenBot's file system.
2. Cloudinary owns bytes and transformations; iPix Supabase owns asset identity, brand/shoot linkage and approval status.
3. Inspect legacy signed upload/delivery utilities as **ADAPT** sources and port only required code into `ipix-open`; never call legacy deployed APIs. A public ID or URL is not authorization.
4. Keep secrets server-side and show only appropriately authorized asset URLs.
5. Require human approval for commerce linking, publishing or irreversible media operations. Verify signed upload expiry, server-side metadata ownership, webhook signatures and retries against the installed SDK and https://cloudinary.com/documentation.
For a write path, read [references/media-lifecycle.md](references/media-lifecycle.md) before implementing. For a read-only gallery, reuse existing OpenBot UI and authorized delivery.

## Example
Show approved campaign images to the authorized brand while hiding Org B's image records.
## Verify
Signature expiry, tenant denial, stable metadata, retry/duplicate upload behavior and rejected asset handling.
