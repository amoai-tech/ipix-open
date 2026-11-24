/** Developer-skill documentation contract only; no app WCAG certification or live release tests. */
import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
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
test("accessibility positive fixture uses an existing tested Bot Setup dialog", () => {
  const skill = read(".claude/skills/accessibility-audit/SKILL.md");
  const fixture = JSON.parse(
    read(".claude/skills/evals/accessibility-routing.json"),
  ) as { cases: { id: string; prompt: string; expected: string }[] };
  const positive = fixture.cases.find((x) => x.id === "a11y-real-ui");
  for (const file of [
    "app/src/components/bot-profile/setup.tsx",
    "app/tests/bot-setup-agent-url.test.tsx",
  ]) {
    expect(existsSync(join(root, file))).toBe(true);
    expect(skill).toContain(file);
    expect(positive?.prompt).toContain(file);
  }
  expect(skill).toContain("Only when a fix was explicitly requested");
  expect(positive?.expected).toContain("NOT VERIFIED");
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
  expect(evals).toContain("run-routing-readonly.py");
  const runner = read(".claude/skills/evals/run-routing-readonly.py");
  expect(runner).toContain("--without-checkout");
  expect(runner).toContain("--dry-run");
  expect(runner).toContain("--no-session-persistence");
  expect(runner).toContain("--restricted");
  expect(runner).toContain("--strict-mcp-config");
  expect(runner).toContain("--model");
  expect(runner).toContain("NOT VERIFIED");
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
