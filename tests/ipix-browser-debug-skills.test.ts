/** Developer-skill metadata and fixture checks. Not live browser tests or skill invocation certification. */
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const base = resolve(import.meta.dir, "..");
const names = ["browser-journey-testing", "root-cause-debugging"] as const;
const read = (p: string) => readFileSync(join(base, p), "utf8");

test("browser and debugging skills expose valid metadata and local links", () => {
  for (const name of names) {
    const path = join(base, ".claude/skills", name, "SKILL.md");
    const contents = readFileSync(path, "utf8");
    const yaml = contents.match(/^---\n([\s\S]+?)\n---\n/);
    expect(yaml).not.toBeNull();
    const metadata = Bun.YAML.parse(yaml?.[1] ?? "") as {
      name?: string;
      description?: string;
    };
    expect(metadata.name).toBe(name);
    expect((metadata.description ?? "").length).toBeGreaterThan(70);
    expect(contents.split("\n").length).toBeLessThan(500);
    const sourceRefs = [
      ...contents.matchAll(
        /https:\/\/github\.com\/[^\s/]+\/[^\s/]+\/blob\/([^\s/]+)\//g,
      ),
    ];
    expect(sourceRefs.length).toBeGreaterThan(0);
    for (const ref of sourceRefs) expect(ref[1]).toMatch(/^[a-f0-9]{40}$/);
  }
});
test("routing includes positive and negative prompts for both skills", () => {
  const evals = JSON.parse(
    read(".claude/skills/evals/browser-debug-routing.json"),
  ) as {
    cases: {
      id: string;
      skill: string;
      shouldTrigger: boolean;
      prompt: string;
      expected: string;
    }[];
  };
  expect(evals.cases).toHaveLength(4);
  expect(new Set(evals.cases.map((x) => x.id)).size).toBe(4);
  for (const name of names) {
    expect(
      evals.cases
        .filter((x) => x.skill === name)
        .map((x) => x.shouldTrigger)
        .sort(),
    ).toEqual([false, true]);
  }
  for (const item of evals.cases) {
    expect(item.prompt.length).toBeGreaterThan(80);
    expect(item.expected.length).toBeGreaterThan(65);
  }
});
test("real browser proof and debugging guardrails remain explicit", () => {
  const browser = read(".claude/skills/browser-journey-testing/SKILL.md");
  const debug = read(".claude/skills/root-cause-debugging/SKILL.md");
  for (const term of [
    "nonproduction",
    "readback",
    "NOT VERIFIED",
    "isolated browser",
  ])
    expect(browser).toContain(term);
  expect(debug).toContain("**Smallest RED signal:**");
  expect(debug).toContain("**Prove GREEN:**");
  expect(debug).toContain("regression");
  expect(debug).toContain("root cause");
});
