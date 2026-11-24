import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
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

  test("ships only two built-in coworkers and no remote Planner or grants", () => {
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
    expect(remote).toHaveLength(0);
    expect(agents).toHaveLength(2);
    expect(ids.has("ipix-production-planner")).toBe(false);
    expect(
      channels.flatMap(
        (c: { permitted_agents: string[] }) => c.permitted_agents,
      ),
    ).not.toContain("ipix-production-planner");
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

  test("default assistants have no authoring grants and knowledge metadata is not OneDrive", () => {
    for (const slug of ["bot-creator", "skill-creator"]) {
      const skill = read("skills.yaml").skills.find(
        (s: { slug: string }) => s.slug === slug,
      );
      expect(skill.summary).toContain("Requires an explicit operator grant");
    }
    for (const agent of read("agents.yaml").agents) {
      expect(agent.skills ?? []).not.toContain("bot-creator");
      expect(agent.skills ?? []).not.toContain("skill-creator");
    }
    expect(
      read("knowledge.yaml").sources.map((s: { type: string }) => s.type),
    ).toEqual(["google-drive"]);
  });

  test("Compose guard refuses each missing required file before executing server", () => {
    const { services } = parse(
      readFileSync(join(root, "docker-compose.yml"), "utf8"),
    );
    const script = services.server.entrypoint[2].replaceAll("$$", "$");
    const fixture = mkdtempSync(join(tmpdir(), "ipix-package-guard-"));
    const names = ["brand", "agents", "channels", "model", "knowledge"];
    try {
      for (const missing of names) {
        for (const name of names)
          writeFileSync(join(fixture, `${name}.yaml`), "test\n");
        rmSync(join(fixture, `${missing}.yaml`));
        const result = spawnSync("/bin/sh", ["-ec", script], {
          env: {
            ...process.env,
            TENANT_PACKAGE_DIR: fixture,
            OPENBOT_REFUSAL_FILE: join(fixture, "refusal"),
          },
          encoding: "utf8",
        });
        expect(result.status).toBe(78);
        expect(result.stderr).toContain(`${missing}.yaml`);
        expect(readFileSync(join(fixture, "refusal"), "utf8")).toContain(
          `${missing}.yaml`,
        );
      }
      writeFileSync(join(fixture, "knowledge.yaml"), "");
      const result = spawnSync("/bin/sh", ["-ec", script], {
        env: {
          ...process.env,
          TENANT_PACKAGE_DIR: fixture,
          OPENBOT_REFUSAL_FILE: join(fixture, "refusal"),
        },
        encoding: "utf8",
      });
      expect(result.status).toBe(78);
      expect(result.stderr).toContain("knowledge.yaml");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  test("Planner environment settings cannot activate an undeclared server agent", () => {
    for (const file of ["agents.yaml", "channels.yaml"]) {
      const source = readFileSync(join(dir, file), "utf8");
      expect(source).not.toContain("IPIX_MASTRA_");
      expect(source).not.toContain("ipix-production-planner");
    }
    expect(readdirSync(join(dir, "agents"))).toEqual(["README.md"]);
    const compose = parse(
      readFileSync(join(root, "docker-compose.yml"), "utf8"),
    );
    expect(compose.services.server.env_file).toContainEqual({
      path: `\${OPENBOT_SERVER_ENV_FILE:-./.env}`,
      required: false,
    });
  });

  test("mounts the real package read-only without shipping a customer-owned override", () => {
    const compose = parse(
      readFileSync(join(root, "docker-compose.yml"), "utf8"),
    );
    const server = compose.services.server;
    expect(existsSync(join(root, "docker-compose.override.yml"))).toBe(false);
    expect(server.environment.TENANT_PACKAGE_DIR).toBe(
      `\${TENANT_PACKAGE_DIR:-../config/ipix}`,
    );
    expect(server.volumes).toContainEqual({
      type: "bind",
      source: "./config/ipix",
      target: "/app/config/ipix",
      read_only: true,
      bind: { create_host_path: true },
    });
  });
});
