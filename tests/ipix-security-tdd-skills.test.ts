/** Documentation-only checks: no RLS runtime write, skill invocation, or security certification. */
import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
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
  expect(data.cases).toHaveLength(6);
  for (const name of names) {
    expect(
      data.cases
        .filter((x) => x.skill === name)
        .map((x) => x.shouldTrigger)
        .filter((value, index, values) => values.indexOf(value) === index)
        .sort(),
    ).toEqual([false, true]);
  }
  expect(new Set(data.cases.map((x) => x.id)).size).toBe(6);
  for (const entry of data.cases) {
    expect(entry.prompt.length).toBeGreaterThan(70);
    expect(entry.expected.length).toBeGreaterThan(55);
  }
});
test("revoked approval retry is required and routed to both appropriate skills", () => {
  const security = read(".claude/skills/security-threat-modeling/SKILL.md");
  const tdd = read(".claude/skills/test-driven-development/SKILL.md");
  const fixtures = JSON.parse(
    read(".claude/skills/evals/security-tdd-routing.json"),
  ) as { cases: { id: string; skill: string; shouldTrigger: boolean }[] };
  expect(security).toContain("revoke A's Brand A permission");
  expect(security).toContain("zero new shoot records");
  expect(security).toContain("reauthorizes on execution/resume");
  expect(tdd).toContain("revocation between approval");
  for (const id of [
    "security-approval-revoked-retry",
    "tdd-approval-revoked-retry",
  ]) {
    const fixture = fixtures.cases.find((x) => x.id === id);
    expect(fixture?.shouldTrigger).toBe(true);
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
  expect(tdd).not.toContain("`root-cause-debugging`");
  expect(tdd).toContain("installed Bun runner");
  for (const source of [sec, tdd]) {
    const siblingNames = [
      ...source.matchAll(/`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`/g),
    ]
      .map((match) => match[1])
      .filter((name) => name !== "ipix-open");
    for (const name of siblingNames)
      expect(existsSync(join(root, ".claude/skills", name, "SKILL.md"))).toBe(
        true,
      );
  }
  for (const value of [
    "RED",
    "GREEN",
    "reject=0",
    "readback",
    "public interface",
  ])
    expect(tdd).toContain(value);
});
