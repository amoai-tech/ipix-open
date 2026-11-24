---
name: vercel-react-best-practices
description: "Use when writing or optimizing OpenBot React/Vite UI for network waterfalls, slow cards, bundle size, rerenders, data caching, long lists, or interaction performance."
---

# Vercel React best practices — OpenBot adaptation

**Source — ADAPT:** https://github.com/amoai-tech/ipixai/tree/main/.agents/skills/vercel-react-best-practices

**Official upstream:** https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices

Apply React optimization guidance **selectively** to the installed OpenBot React/Vite stack; it is not a Next.js application. The upstream Vercel pack includes Next.js-specific rules: do not copy RSC, App Router, `next/dynamic`, server actions, or SWR without verifying they belong here.

## Prioritized performance pass

1. **Measure first.** Name the slow UI and gather a before/after network waterfall, browser profile/render counts, Vite build chunk size or repeatable interaction, using the same route/device/data.
2. **Eliminate waterfalls:** parallelize independent work where safe, but keep OpenBot's generated API client and TanStack Query factories (`openbot-data-access`), org-aware caching and error handling.
3. **Reduce bundles:** follow existing Vite route splitting/dynamic `import()`; measure before/after.
4. **Limit rerenders:** derive state, use correct keys, scope subscriptions, memoize only measured expensive computation.
5. **Large lists and media:** optimize image loading or virtualize only when real list sizes demand it; keep keyboard and accessible navigation.
6. **AI cards and streaming:** preserve partial/final states, focus, edits, approvals and cancellation when optimizing.
7. **Keep it small:** apply `ponytail`; never add a second query cache or break server authorization to gain speed.

## Source-to-OpenBot mapping

| Vercel topic | Use in OpenBot |
| --- | --- |
| Async waterfalls | Existing query factories; independent `Promise.all` |
| Bundle size | Vite lazy/dynamic imports after measurement |
| Render cost | React profiler, derived state, selective memoization |
| Client caching | Existing TanStack Query, not a second SWR layer |
| RSC/server actions/Next.js routing | Not applicable unless a separate installed runtime proves otherwise |

**Example:** For a gallery with 200 assets, first measure scroll and network cost, reuse existing image/list components, then test one loading/render improvement on desktop and mobile.

**Verify:** Before/after metrics, real route and browser conditions, no regressions in approvals, keyboard use, error states or selection.
