# iPix skills adapted for OpenBot

Ten developer skills adapted from the iPix source commit 13bf2af385ebbe68a78c652daf5cffa3db95df24. These are **developer instructions**, not installed runtime Bot skills or proof that Mastra integration works.

Source: https://github.com/amoai-tech/ipixai/tree/13bf2af385ebbe68a78c652daf5cffa3db95df24/.agents/skills

Added: fashion-production, mastra, ipix-supabase, copilotkit, tasks, task-verifier, cloudinary, mermaid-diagrams, domain-modeling, qa-review.

Preserved unchanged: openbot-copy, openbot-data-access, openbot-screen-layout.

The source's large optional reference trees are **not** copied: new SKILL.md files are self-contained and source-linked, with no dangling local references or scripts. Add individual references only when a concrete task needs them and their version/security assumptions have been reviewed.

Official authoring reference: https://github.com/anthropics/claude-plugins-official/blob/main/plugins/skill-creator/skills/skill-creator/SKILL.md

Test prompts: (1) plan a 24-shot fashion campaign; (2) connect the remote Mastra Planner without duplicate runtime; (3) prove Org B access and double approval are rejected.
