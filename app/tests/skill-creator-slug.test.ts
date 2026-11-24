import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { SKILL_CREATOR_SLUG } from "@/lib/skills/proposal";

/** The iPix package retains the native authoring slug for explicit operator grants,
 * but neither default coworker holds it. Keep the SDK coupling and intentional
 * default-deny policy visible in tests; user-authorized writes still use native APIs.
 */

const packageDir = fileURLToPath(new URL("../../config/ipix", import.meta.url));

const shipped = parse(readFileSync(`${packageDir}/skills.yaml`, "utf8")) as {
  skills: { slug: string; title: string; instructions: string }[];
};

const roster = parse(readFileSync(`${packageDir}/agents.yaml`, "utf8")) as {
  agents: { id: string; skills?: string[] }[];
};

describe("the shipped package and the app agree on the authoring skill", () => {
  test("the package ships a skill under the slug the app gates on", () => {
    const slugs = shipped.skills.map((skill) => skill.slug);
    expect(slugs).toContain(SKILL_CREATOR_SLUG);
  });

  test("no default iPix coworker is granted authoring", () => {
    // Intentional iPix policy: definitions are available for explicit authorized grants only.
    const holders = roster.agents.filter((agent) =>
      (agent.skills ?? []).includes(SKILL_CREATOR_SLUG),
    );
    expect(holders).toEqual([]);
  });

  test("its instruction names the tool that actually saves the skill", () => {
    // The instruction is the feature. One that never reaches `save_skill` produces a Bot that
    // interviews somebody thoroughly and then asks them to retype it into the form.
    const creator = shipped.skills.find(
      (skill) => skill.slug === SKILL_CREATOR_SLUG,
    );
    expect(creator?.instructions).toContain("save_skill");
  });
});
