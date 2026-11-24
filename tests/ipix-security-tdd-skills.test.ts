/** Documentation-only checks: no RLS runtime write, skill invocation, or security certification. */
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const names = ["security-threat-modeling", "test-driven-development"] as const;
const read = (p: string) => readFileSync(join(root, p), "utf8");

test("security and TDD skills have correctly scoped frontmatter", () => {
  for (const name of names) {
    const source = read(`.claude/skills/${name}/SKILL.md`);
    const frontmatter = source.match(/^---\n([\s\S]+?)\n---\n/);
    expect(frontmatter).not.toBeNull();
    const meta = Bun.YAML.parse(frontmatter?.[1] ?? "") as {
      name?: string;
      description?: string;
    };
    expect(meta.name).toBe(name);
    expect((meta.description ?? "").length).toBeGreaterThan(70);
    expect(source.split("\n").length).toBeLessThan(500);
    expect(source).toContain("Reference —");
    expect(source).toContain("Verify:");
    expect(source).toContain("Do not copy:");
  }
});
test("two positive and two negative evaluation cases are well formed", () => {
  const data = JSON.parse(
    read(".claude/skills/evals/security-tdd-routing.json"),
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
  expect(data.version).toBe(1);
  expect(data.cases).toHaveLength(4);
  for (const name of names) {
    expect(
      data.cases
        .filter((x) => x.skill === name)
        .map((x) => x.shouldTrigger)
        .sort(),
    ).toEqual([false, true]);
  }
  expect(new Set(data.cases.map((x) => x.id)).size).toBe(4);
  for (const entry of data.cases) {
    expect(entry.prompt.length).toBeGreaterThan(70);
    expect(entry.expected.length).toBeGreaterThan(55);
  }
});
test("cross-tenant authorization and red/green persistence proof are required", () => {
  const sec = read(".claude/skills/security-threat-modeling/SKILL.md");
  const tdd = read(".claude/skills/test-driven-development/SKILL.md");
  for (const value of [
    "untrusted",
    "server",
    "tenant",
    "NOT VERIFIED",
    "prompt injection",
  ])
    expect(sec.toLowerCase()).toContain(value.toLowerCase());
  for (const value of [
    "RED",
    "GREEN",
    "reject=0",
    "readback",
    "public interface",
  ])
    expect(tdd).toContain(value);
});
