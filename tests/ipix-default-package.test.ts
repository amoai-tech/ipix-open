import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const root = join(import.meta.dir, "..");
const dir = join(root, "config/ipix");
const read = (file: string) => parse(readFileSync(join(dir, file), "utf8"));

describe("canonical iPix application package", () => {
  test("ships required tenant files and preserves the existing seed identity", () => {
    for (const file of [
      "brand.yaml",
      "agents.yaml",
      "channels.yaml",
      "model.yaml",
      "knowledge.yaml",
      "skills.yaml",
    ]) {
      expect(read(file)).toBeTruthy();
    }
    expect(read("brand.yaml").tenant).toEqual({
      id: "openbot",
      product_name: "iPix",
    });
    expect(readFileSync(join(root, ".env.example"), "utf8")).toContain(
      "TENANT_PACKAGE_DIR=../config/ipix\n",
    );
  });

  test("loads two built-in coworkers and keeps the remote Planner opt-in", () => {
    const { agents } = read("agents.yaml");
    const { skills } = read("skills.yaml");
    const { channels } = read("channels.yaml");
    const slugs = new Set(skills.map((s: { slug: string }) => s.slug));
    const ids = new Set(agents.map((a: { id: string }) => a.id));
    expect(ids.size).toBe(agents.length);
    expect(slugs.size).toBe(skills.length);
    expect(
      agents
        .filter((a: { type: string }) => a.type === "built-in")
        .map((a: { name: string }) => a.name),
    ).toEqual(["Production Assistant", "Brand Knowledge"]);
    const remote = agents.filter(
      (a: { type: string }) => a.type !== "built-in",
    );
    expect(remote).toHaveLength(1);
    expect(remote[0]).toMatchObject({
      type: "remote-mastra",
      endpoint: `\${IPIX_MASTRA_URL:-}`,
      remote_agent_id: `\${IPIX_MASTRA_AGENT_ID:-production-planner}`,
    });
    for (const a of agents) {
      for (const slug of a.skills ?? []) expect(slugs.has(slug)).toBe(true);
    }
    for (const c of channels) {
      for (const id of c.permitted_agents) expect(ids.has(id)).toBe(true);
    }
    expect(
      readdirSync(join(dir, "agents")).filter((f) => f.endsWith(".yaml")),
    ).toEqual([]);
    for (const slug of ["creative-brief", "shoot-plan"]) {
      expect(
        skills.find((s: { slug: string }) => s.slug === slug).tools,
      ).toEqual([]);
    }
  });

  test("mounts the real package read-only, without altering the upstream base compose", () => {
    const override = parse(
      readFileSync(join(root, "docker-compose.override.yml"), "utf8"),
    );
    const server = override.services.server;
    expect(server.environment.TENANT_PACKAGE_DIR).toBe(
      `\${TENANT_PACKAGE_DIR:-../config/ipix}`,
    );
    expect(server.volumes).toContainEqual({
      type: "bind",
      source: "./config/ipix",
      target: "/app/config/ipix",
      read_only: true,
      bind: { create_host_path: false },
    });
  });
});
