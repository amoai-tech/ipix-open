/** Developer-skill documentation contract only; no app WCAG certification or live release tests. */
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

test("accessibility skill uses valid scoped metadata, references and audit limits", () => {
  const skill = read(".claude/skills/accessibility-audit/SKILL.md");
  const fm = skill.match(/^---\n([\s\S]*?)\n---\n/);
  expect(fm).not.toBeNull();
  const meta = Bun.YAML.parse(fm?.[1] ?? "") as {
    name?: string;
    description?: string;
  };
  expect(skill).toContain("Audit-only requests: report findings and stop.");
  expect(skill).toContain("Native Expo/React Native");
  expect(skill).toContain("responsive web");
  expect(meta.name).toBe("accessibility-audit");
  expect((meta.description ?? "").length).toBeGreaterThan(70);
  expect(skill.split("\n").length).toBeLessThan(500);
  for (const word of [
    "WCAG 2.2 AA",
    "keyboard",
    "screen reader",
    "NOT VERIFIED",
    "Do not copy:",
    "Verify:",
  ])
    expect(skill).toContain(word);
});
test("existing QA, task and verifier invariants survive improvements", () => {
  const qa = read(".claude/skills/qa-review/SKILL.md");
  const tasks = read(".claude/skills/tasks/SKILL.md");
  const verifier = read(".claude/skills/task-verifier/SKILL.md");
  expect(qa).toContain("every distinct evidence-backed merge risk");
  expect(qa).toContain("up to five");
  expect(qa).toContain("known bad fixture fails");
  expect(tasks).toContain("exact tested Git commit");
  expect(tasks).toContain("N/A — no runtime change");
  expect(verifier).toContain("mandatory, never N/A");
  expect(verifier).toContain("release-classification");
  expect(verifier).toContain("NOT VERIFIED");
  expect(verifier).toContain("exact human approval");
});
test("skill comparison and a11y routing distinguish true evidence from claims", () => {
  const evals = read(".claude/skills/evals/README.md");
  for (const value of [
    "blinded eval playbook",
    "skill-absent baseline",
    "model and tool permissions",
    "NOT VERIFIED",
  ])
    expect(evals).toContain(value);
  const cases = JSON.parse(
    read(".claude/skills/evals/accessibility-routing.json"),
  ) as {
    cases: {
      id: string;
      skill: string;
      shouldTrigger: boolean;
      prompt: string;
      expected: string;
    }[];
  };
  expect(cases.cases).toHaveLength(2);
  expect(cases.cases.map((c) => c.shouldTrigger).sort()).toEqual([false, true]);
  for (const c of cases.cases) {
    expect(c.skill).toBe("accessibility-audit");
    expect(c.prompt.length).toBeGreaterThan(80);
    expect(c.expected.length).toBeGreaterThan(55);
  }
});
