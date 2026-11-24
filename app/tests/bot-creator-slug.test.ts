import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { BOT_CREATOR_SLUG } from "@/lib/agents/proposal";

/** The iPix package retains the native authoring slug for explicit operator grants,
 * but neither default coworker holds it. Keep the SDK coupling and intentional
 * default-deny policy visible in tests; user-authorized writes still use native APIs.
 */

const PACKAGE = join(import.meta.dir, "../../config/ipix");

type SkillsFile = { skills: { slug: string; tools?: unknown }[] };
type AgentsFile = { agents: { id: string; skills?: string[] }[] };

function read<T>(file: string): T {
  return parse(readFileSync(join(PACKAGE, file), "utf8")) as T;
}

test("the deployment ships a skill under the slug the app gates on", () => {
  const { skills } = read<SkillsFile>("skills.yaml");
  const shipped = skills.find((skill) => skill.slug === BOT_CREATOR_SLUG);

  expect(shipped).toBeDefined();
});

test("no default iPix Bot holds the authoring grant", () => {
  const { agents } = read<AgentsFile>("agents.yaml");
  const holders = agents.filter((agent) =>
    (agent.skills ?? []).includes(BOT_CREATOR_SLUG),
  );

  // Explicit operator grants are required; default fashion conversations do not offer authoring.
  expect(holders).toEqual([]);
});

/**
 * The declaration stays empty, and that is a rule rather than an accident.
 *
 * `tools:` on a skill is intersected with its Bot's MCP grants to narrow what a run is offered. The
 * four tools this skill exists for are the app's own, registered in the browser and gated on the
 * grant of the skill itself — they are not MCP refs and can never appear in a grant. Naming them
 * here would therefore name nothing, while looking exactly like the thing that makes them work.
 */
test("it declares no tools, because the ones it is for are not MCP refs", () => {
  const { skills } = read<SkillsFile>("skills.yaml");
  const shipped = skills.find((skill) => skill.slug === BOT_CREATOR_SLUG);

  expect(shipped?.tools ?? []).toEqual([]);
});
