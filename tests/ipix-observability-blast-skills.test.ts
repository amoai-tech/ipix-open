/** Static developer-guidance tests, not production observability or live regression evidence. */
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const base = resolve(import.meta.dir, "..");
const names = ["production-observability", "blast-radius-analysis"] as const;
const read = (p: string) => readFileSync(join(base, p), "utf8");

test("production monitoring and blast-radius skills have valid scoped frontmatter", () => {
  for (const name of names) {
    const text = read(`.claude/skills/${name}/SKILL.md`);
    const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
    expect(fm).not.toBeNull();
    const parsed = Bun.YAML.parse(fm?.[1] ?? "") as {
      name?: string;
      description?: string;
    };
    expect(parsed.name).toBe(name);
    expect((parsed.description ?? "").length).toBeGreaterThan(70);
    expect(text.split("\n").length).toBeLessThan(500);
    expect(text).toContain("Reference —");
    expect(text).toContain("Do not copy:");
    expect(text).toContain("Verify:");
  }
});
test("two positive and two near-miss evaluation examples distinguish their scopes", () => {
  const data = JSON.parse(
    read(".claude/skills/evals/observability-blast-routing.json"),
  ) as {
    cases: {
      id: string;
      skill: string;
      shouldTrigger: boolean;
      prompt: string;
      expected: string;
    }[];
  };
  expect(data.cases).toHaveLength(4);
  expect(new Set(data.cases.map((c) => c.id)).size).toBe(4);
  for (const name of names) {
    expect(
      data.cases
        .filter((c) => c.skill === name)
        .map((c) => c.shouldTrigger)
        .sort(),
    ).toEqual([false, true]);
  }
  for (const c of data.cases) {
    expect(c.prompt.length).toBeGreaterThan(70);
    expect(c.expected.length).toBeGreaterThan(55);
  }
});
test("guidance forbids raw secrets and requires observable runtime evidence", () => {
  const obs = read(".claude/skills/production-observability/SKILL.md");
  const blast = read(".claude/skills/blast-radius-analysis/SKILL.md");
  expect(obs).not.toContain("`root-cause-debugging`");
  expect(
    read(".claude/skills/evals/observability-blast-routing.json"),
  ).not.toContain("root-cause-debugging");
  for (const t of ["secrets", "readback", "NOT VERIFIED", "existing"])
    expect(obs).toContain(t);
  for (const t of ["Graphify", "NOT VERIFIED", "test", "generic"])
    expect(blast).toContain(t);
});
