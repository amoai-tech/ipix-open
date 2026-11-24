import { expect, test } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const dir = join(root, ".github/workflows");
type Job = {
  if?: string;
  "runs-on"?: string;
  environment?: string;
  strategy?: { matrix?: { os?: string } };
  steps?: { id?: string; run?: string }[];
};
type Workflow = { on: Record<string, unknown>; jobs: Record<string, Job> };
const read = (file: string) =>
  Bun.YAML.parse(readFileSync(join(dir, file), "utf8")) as Workflow;

test("no workflow or runner matrix requests CopilotKit's unavailable larger runners", () => {
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".yml"))) {
    expect(read(file).jobs, file).toBeDefined();
    const source = readFileSync(join(dir, file), "utf8");
    expect(source, file).not.toMatch(/openbot-(ubuntu|windows)-16core/);
    expect(source, file).not.toContain("uses: ./.github/");
  }
});

test("web CI and security remain automatic; desktop release and upstream jobs are selective", () => {
  for (const file of [
    "ci.yml",
    "security_zizmor.yml",
    "desktop.yml",
    "model-lock.yml",
  ]) {
    expect(read(file).on).toHaveProperty("pull_request");
  }
  for (const file of [
    "desktop-signing.yml",
    "contributor-ci.yml",
    "downloads-sync.yml",
    "model-compat.yml",
  ]) {
    expect(Object.keys(read(file).on)).toEqual(["workflow_dispatch"]);
  }
  expect(Object.keys(read("desktop-macos-signing.yml").on).sort()).toEqual([
    "push",
    "workflow_dispatch",
  ]);
  expect(read("desktop-macos-signing.yml").on.push).toEqual({ tags: ["v*"] });
  expect(read("desktop-signing.yml").jobs.sign?.environment).toBe(
    "windows-signing",
  );
  expect(read("desktop-macos-signing.yml").jobs.sign?.environment).toBe(
    "macos-signing",
  );
  expect(read("contributor-ci.yml").jobs.yield?.if).toBe(
    "github.repository == 'CopilotKit/OpenBot'",
  );
  expect(
    read("desktop.yml").jobs.core?.steps?.some(
      (step) => step.run === "cargo test --locked --lib --bins",
    ),
  ).toBe(true);
});

test("Linux startup is the default; cross-platform startup is explicit", () => {
  const ci = read("ci.yml");
  const optIn = {
    cross_platform_startup: expect.objectContaining({
      type: "boolean",
      default: false,
    }),
  };
  expect(ci.on.workflow_dispatch).toEqual(
    expect.objectContaining({ inputs: optIn }),
  );
  expect(ci.on.workflow_call).toEqual(
    expect.objectContaining({ inputs: optIn }),
  );
  expect(ci.jobs.startup?.strategy?.matrix?.os).toBe(
    `\${{ fromJSON(inputs.cross_platform_startup == true && '["ubuntu-latest","macos-latest","windows-latest"]' || '["ubuntu-latest"]') }}`,
  );
  const selector = readFileSync(join(root, "scripts/ci-changes.ts"), "utf8");
  expect(selector).toContain('checks: ["startup (ubuntu-latest)"]');
});

test("upgrade regressions run only for relevant PRs; historical runs are explicit", () => {
  const upgrade = read("desktop-upgrade.yml");
  expect(Object.keys(upgrade.on).sort()).toEqual([
    "pull_request",
    "workflow_dispatch",
  ]);
  expect(upgrade.on.pull_request).toEqual({
    paths: [
      "desktop/src-tauri/**",
      "desktop/scripts/upgrade-legs.ts",
      "docker-compose.yml",
      "backend-images.env",
      "release-policy.json",
      ".github/workflows/desktop-upgrade.yml",
    ],
  });
  expect(upgrade.jobs.legs?.if).toBe(
    "github.event_name == 'workflow_dispatch' && inputs.scope == 'window'",
  );
  expect(upgrade.jobs.upgrade?.if).toContain(
    "github.event_name == 'pull_request'",
  );
  expect(
    upgrade.jobs.upgrade?.steps?.find((step) => step.id === "from")?.run,
  ).toContain("An upgrade was not tested.");
});

test("model lock selection uses the actual workflow shell without real provider calls", () => {
  const run = read("model-lock.yml").jobs.changed?.steps?.find(
    (step) => step.id === "list",
  )?.run;
  expect(run).toBeDefined();
  const script = run!
    .replace(
      'changed=$(git diff --name-only "$BASE_SHA...$HEAD_SHA")',
      'changed="$TEST_CHANGED"',
    )
    .replace(
      "checked=$(bun scripts/model-compat.ts harnesses)",
      'checked="$TEST_CHECKED"',
    );
  expect(script).not.toBe(run);
  const temp = mkdtempSync(join(tmpdir(), "ipix-ci-policy-"));
  try {
    for (const [index, [changed, expected]] of (
      [
        [".github/workflows/model-lock.yml", []],
        ["agent-crewai/requirements.txt", []],
        ["agent-langgraph-ts/package-lock.json", ["agent-langgraph-ts"]],
        [
          "agent-mastra/Dockerfile\nagent-langgraph-ts/src/main.ts",
          ["agent-mastra"],
        ],
        [
          "agent-langgraph-agui/src/chatgpt_models.py",
          ["agent-langgraph-agui"],
        ],
      ] as const
    ).entries()) {
      const outputFile = join(temp, String(index));
      const result = Bun.spawnSync(["bash", "-c", script], {
        cwd: root,
        env: {
          ...process.env,
          GITHUB_EVENT_NAME: "pull_request",
          TEST_CHANGED: changed,
          TEST_CHECKED: JSON.stringify([
            "agent-langgraph-ts",
            "agent-langgraph-agui",
            "agent-mastra",
            "agent-claude-sdk",
          ]),
          GITHUB_OUTPUT: outputFile,
        },
      });
      expect(result.exitCode, result.stderr.toString()).toBe(0);
      const output = readFileSync(outputFile, "utf8")
        .split("\n")
        .find((line) => line.startsWith("harnesses="));
      expect(JSON.parse(output!.slice("harnesses=".length))).toEqual(expected);
    }
    // Explicit dispatch exercises the same probe selection without exposing provider keys.
    for (const [harness, valid] of [
      ["agent-mastra", true],
      ["agent-langgraph-ts", true],
      ["agent-crewai", false],
    ] as const) {
      const outputFile = join(temp, harness);
      const result = Bun.spawnSync(["bash", "-c", script], {
        cwd: root,
        env: {
          ...process.env,
          GITHUB_EVENT_NAME: "workflow_dispatch",
          REQUESTED_HARNESS: harness,
          TEST_CHECKED: JSON.stringify(["agent-mastra", "agent-langgraph-ts"]),
          GITHUB_OUTPUT: outputFile,
        },
      });
      if (valid) {
        expect(result.exitCode, result.stderr.toString()).toBe(0);
        expect(readFileSync(outputFile, "utf8").trim()).toBe(
          `harnesses=${JSON.stringify([harness])}`,
        );
      } else {
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr.toString()).toContain(
          "unsupported or retired harness",
        );
      }
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
