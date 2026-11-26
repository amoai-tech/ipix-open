// Local-only customer signup and RLS proof. Uses ordinary Auth API, not admin credentials.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = realpathSync(fileURLToPath(new URL("..", import.meta.url)));
const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, { cwd: root, encoding: "utf8", ...options });
const db = "supabase_db_ipixopen1505";
const api = "http://127.0.0.1:56221";
assert(
  !existsSync(`${root}/supabase/.temp/project-ref`),
  "Linked project refused",
);
for (const [name, port, hostPort] of [
  [db, "5432/tcp", "56222"],
  ["supabase_kong_ipixopen1505", "8000/tcp", "56221"],
]) {
  const info = JSON.parse(run("docker", ["container", "inspect", name]))[0];
  assert.equal(info.Config.Labels["com.supabase.cli.workdir"], root);
  assert.equal(info.Config.Labels["com.supabase.cli.project"], "ipixopen1505");
  assert.deepEqual(info.NetworkSettings.Ports[port], [
    { HostIp: "127.0.0.1", HostPort: hostPort },
  ]);
}
const local = JSON.parse(
  run("supabase", ["--workdir", root, "status", "-o", "json"], {
    stdio: ["ignore", "pipe", "pipe"],
  }),
);
assert.equal(local.API_URL, api);
const key = local.PUBLISHABLE_KEY || local.ANON_KEY;
assert(key);
async function call(path, { method = "GET", body, session } = {}) {
  const headers = { apikey: key, "content-type": "application/json" };
  if (session) headers.authorization = `Bearer ${session}`;
  const res = await fetch(api + path, {
    method,
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(15000),
    ...(body && { body: JSON.stringify(body) }),
  });
  // Preserve HTTP status even for a non-JSON proxy/server failure.
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

function authFailure(result) {
  const code = result.data?.error_code ?? result.data?.code;
  const safeCode =
    typeof code === "string" && /^[a-z0-9_]{1,80}$/.test(code)
      ? code
      : "unknown_error";
  return `HTTP ${result.status} (${safeCode})`;
}

const customers = [
  {
    label: "A",
    email: "ipi1084-owner-a@ipix.test",
    org: "10840000-0000-4000-8000-00000000000a",
    brand: "10840000-0000-4000-8000-0000000000aa",
  },
  {
    label: "B",
    email: "ipi1084-orgb@ipix.test",
    org: "10840000-0000-4000-8000-00000000000b",
    brand: "10840000-0000-4000-8000-0000000000bb",
  },
];
// Known local-only test password; never used for hosted accounts.
const password = "ipi1084-local-e2e-password";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
for (const customer of customers) {
  const body = { email: customer.email, password };
  let login = await call("/auth/v1/token?grant_type=password", {
    method: "POST",
    body,
  });
  if (!login.ok) {
    // invalid_credentials also covers wrong passwords. Only create a missing
    // synthetic account, never retry signup for an existing account.
    assert(
      login.status === 400 && login.data?.error_code === "invalid_credentials",
      `Synthetic sign-in failed: ${authFailure(login)}`,
    );
    const existing = run("docker", [
      "exec",
      db,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-Atc",
      `select count(*) from auth.users where email = '${customer.email}';`,
    ]).trim();
    assert.equal(
      existing,
      "0",
      `Synthetic sign-in failed: ${authFailure(login)}; existing account`,
    );
    const signup = await call("/auth/v1/signup", { method: "POST", body });
    assert(signup.ok, `Synthetic signup failed: ${authFailure(signup)}`);
    login = await call("/auth/v1/token?grant_type=password", {
      method: "POST",
      body,
    });
  }
  assert(login.ok, `Synthetic sign-in failed: ${authFailure(login)}`);
  assert.equal(login.data.user.email, customer.email);
  assert(uuid.test(login.data.user.id));
  customer.id = login.data.user.id;
  customer.session = login.data.access_token;
}
assert.notEqual(customers[0].id, customers[1].id);

// Seed only synthetic business records, adapting the audited legacy fixture.
const sql = [
  "begin;",
  ...customers.flatMap((c) => [
    `insert into public.organizations (id,name,slug,type,owner_id) values ('${c.org}','iPix 1084 Org ${c.label}','ipix-1084-org-${c.label.toLowerCase()}','brand','${c.id}') on conflict (id) do nothing;`,
    `insert into public.org_members (org_id,user_id,role) values ('${c.org}','${c.id}','owner') on conflict (org_id,user_id) do nothing;`,
    `insert into public.brands (id,user_id,name,org_id) values ('${c.brand}','${c.id}','IPI-1084 Brand ${c.label}','${c.org}') on conflict (id) do nothing;`,
  ]),
  "commit;",
].join("\n");
run(
  "docker",
  [
    "exec",
    "-i",
    db,
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
  ],
  { input: sql, stdio: ["pipe", "pipe", "pipe"] },
);

for (const c of customers) {
  const get = (path) => call(path, { session: c.session });
  const identity = await get("/auth/v1/user");
  assert(identity.ok);
  assert.equal(identity.data.id, c.id);
  const profile = await get(`/rest/v1/profiles?select=id&id=eq.${c.id}`);
  assert(profile.ok);
  assert.deepEqual(profile.data, [{ id: c.id }]);
  const membership = await get(
    "/rest/v1/org_members?select=org_id,user_id,role",
  );
  assert(membership.ok);
  assert.deepEqual(membership.data, [
    { org_id: c.org, user_id: c.id, role: "owner" },
  ]);
  const organizations = await get("/rest/v1/organizations?select=id,owner_id");
  assert(organizations.ok);
  assert.deepEqual(organizations.data, [{ id: c.org, owner_id: c.id }]);
  const brands = await get("/rest/v1/brands?select=id");
  assert(brands.ok);
  assert.deepEqual(brands.data, [{ id: c.brand }]);
  const foreign = customers.find((other) => other.id !== c.id);
  for (const path of [
    `/rest/v1/brands?select=id&id=eq.${foreign.brand}`,
    `/rest/v1/organizations?select=id&id=eq.${foreign.org}`,
    `/rest/v1/org_members?select=org_id&org_id=eq.${foreign.org}`,
  ]) {
    const denied = await get(path);
    assert(denied.ok, `Foreign read failed: HTTP ${denied.status}`);
    assert.deepEqual(denied.data, []);
  }
  console.log(
    "PASS customer " +
      c.label +
      ": real session, own profile/org/membership/brand, foreign org/membership/brand denied",
  );
}
for (const table of ["brands", "organizations", "org_members"]) {
  const anonymous = await call(`/rest/v1/${table}?select=*`);
  if (anonymous.ok) {
    assert.deepEqual(anonymous.data, []);
  } else {
    assert(
      [401, 403].includes(anonymous.status),
      `Unexpected anonymous response: HTTP ${anonymous.status}`,
    );
  }
}
console.log("PASS anonymous brand, organization and membership access denied");
