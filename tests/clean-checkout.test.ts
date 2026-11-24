import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** The example package must load before a fresh checkout has a .env file. */

const root = join(import.meta.dir, "..");

describe("a clone that has only run bun install", () => {
  test("can read the default iPix tenant package with nothing set", () => {
    // `pretest` loads this package, so a name here with no fallback fails the suite before a single
    // test runs.
    const agents = readFileSync(join(root, "config/ipix/agents.yaml"), "utf8");
    const referenced = [
      ...agents.matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)([^}]*)\}/g),
    ];

    // A package with no environment references is also valid on a fresh checkout.
    expect(agents).toContain("type: built-in");
    for (const [, name, rest] of referenced) {
      expect(
        rest.startsWith(":-"),
        `\${${name}} in agents.yaml has no fallback, so a clone with no .env cannot read it`,
      ).toBe(true);
    }
  });
});
