/**
 * Developer-documentation contracts only.
 *
 * These tests do NOT measure actual Claude skill triggering or user-journey correctness.
 * For behavioral comparisons use .claude/skills/evals/README.md.
 */
import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const skillsRoot = join(root, ".claude", "skills");
const adapted = [
  "cloudinary",
  "copilotkit",
  "domain-modeling",
  "fashion-production",
  "graphify",
  "ipix-supabase",
  "ipix-wireframe",
  "mastra",
  "mermaid-diagrams",
  "ponytail",
  "qa-review",
  "refactor-plan",
  "task-verifier",
  "tasks",
  "vercel-react-best-practices",
] as const;
const original = [
  "openbot-copy",
  "openbot-data-access",
  "openbot-screen-layout",
] as const;

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("all 15 adapted skills have valid, scoped metadata and local references", () => {
  for (const name of adapted) {
    const path = join(skillsRoot, name, "SKILL.md");
    expect(existsSync(path)).toBe(true);
    const source = readFileSync(path, "utf8");
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);
    expect(frontmatter).not.toBeNull();
    const metadata = Bun.YAML.parse(frontmatter?.[1] ?? "") as {
      name?: string;
      description?: string;
    };
    expect(metadata.name).toBe(name);
    expect(typeof metadata.description).toBe("string");
    expect((metadata.description ?? "").length).toBeGreaterThan(35);
    expect((metadata.description ?? "").length).toBeLessThan(500);
    expect(source.split("\n").length).toBeLessThan(500);

    for (const match of source.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(https?:|#|mailto:)/.test(target)) continue;
      const [relative] = target.split("#");
      if (!relative) continue;
      expect(existsSync(resolve(dirname(path), relative))).toBe(true);
    }
  }
  for (const name of original) {
    expect(existsSync(join(skillsRoot, name, "SKILL.md"))).toBe(true);
  }
});

test("shared guides and evaluation docs have no broken local links", () => {
  for (const relative of [
    ".claude/skills/README-ipix.md",
    ".claude/skills/evals/README.md",
    ".claude/skills/evals/observations.md",
  ]) {
    const full = join(root, relative);
    for (const match of readFileSync(full, "utf8").matchAll(/\]\(([^)]+)\)/g)) {
      const destination = match[1];
      if (/^(https?:|#|mailto:)/.test(destination)) continue;
      const [target] = destination.split("#");
      if (target) expect(existsSync(resolve(dirname(full), target))).toBe(true);
    }
  }
});

test("shared ownership contract explicitly distinguishes proposal and implementation", () => {
  const guide = read(".claude/skills/README-ipix.md");
  expect(guide).toContain("standalone iPix application");
  expect(guide).toContain("recheck its current state");
  expect(guide).toContain("migration source");
  expect(guide).toContain("Mastra memory/workflow storage");
  expect(guide).toContain("idempotent");
  const mastra = read(".claude/skills/mastra/SKILL.md");
  expect(mastra).toContain("agent-mastra/src/mastra/index.ts");
  expect(mastra).toContain("server/src/copilot.ts");
  expect(mastra).toContain("verify against the shipped interface");
  expect(mastra).toContain("isolated iPix Planner service");
  expect(mastra).toContain("nonproduction Supabase");
  const copilot = read(".claude/skills/copilotkit/SKILL.md");
  expect(copilot).toContain("@copilotkit/react-core/v2");
  expect(copilot).toContain("OPENBOT_UI");
  expect(copilot).toContain("approval-tools.tsx");
  expect(copilot).toContain("not proof");
});

test("QA and Done rules retain safety while allowing justified N/A", () => {
  const qa = read(".claude/skills/qa-review/SKILL.md");
  expect(qa).toContain("every distinct evidence-backed merge risk");
  expect(qa).toContain("up to five");
  expect(qa).toContain("PASS / FAIL / NOT VERIFIED");
  const verifier = read(".claude/skills/task-verifier/SKILL.md");
  expect(verifier).toContain("N/A — why");
  expect(verifier).toContain("mandatory, never N/A");
  for (const gate of [
    "approval",
    "tenant isolation",
    "exactly-once",
    "retry safety",
  ]) {
    expect(verifier).toContain(gate);
  }
});

test("critical routing fixtures provide realistic positive and near-miss cases", () => {
  const fixtures = JSON.parse(
    read(".claude/skills/evals/critical-routing.json"),
  ) as {
    version: number;
    cases: {
      id: string;
      skill: string;
      shouldTrigger: boolean;
      prompt: string;
      expected: string;
    }[];
  };
  expect(fixtures.version).toBe(1);
  expect(fixtures.cases.length).toBe(12);
  const ids = new Set<string>();
  const bySkill = new Map<string, Set<boolean>>();
  for (const fixture of fixtures.cases) {
    expect(ids.has(fixture.id)).toBe(false);
    ids.add(fixture.id);
    expect(adapted).toContain(fixture.skill as (typeof adapted)[number]);
    expect(fixture.prompt.length).toBeGreaterThan(65);
    expect(fixture.expected.length).toBeGreaterThan(
      fixture.shouldTrigger ? 45 : 25,
    );
    const entries = bySkill.get(fixture.skill) ?? new Set<boolean>();
    entries.add(fixture.shouldTrigger);
    bySkill.set(fixture.skill, entries);
  }
  expect(bySkill.size).toBe(6);
  for (const flags of bySkill.values())
    expect([...flags].sort()).toEqual([false, true]);
});
