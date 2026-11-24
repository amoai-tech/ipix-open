// Local-only OAuth compatibility proof for the actual Supabase consent route.
import { chromium } from "playwright-core";
import { randomBytes, createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
const origin = "http://127.0.0.1:56121";
const ui = "http://127.0.0.1:4175";
const callback = `${ui}/oauth/test-callback`;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
const password = process.env.IPIX_QA_FIXTURE_PASSWORD;
assert.equal(process.env.SUPABASE_URL, origin);
assert.ok(key?.startsWith("sb_publishable_") && password);
const discovery = await fetch(
  `${origin}/auth/v1/.well-known/oauth-authorization-server`,
).then((r) => {
  assert.equal(r.status, 200);
  return r.json();
});
assert.equal(discovery.issuer, `${origin}/auth/v1`);
for (const field of [
  "registration_endpoint",
  "authorization_endpoint",
  "token_endpoint",
])
  assert.equal(new URL(discovery[field]).origin, origin);
const registration = await fetch(discovery.registration_endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: key },
  body: JSON.stringify({
    client_name: "iPix local MCP compatibility test",
    redirect_uris: [callback],
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
  }),
});
assert.ok(registration.ok, `DCR failed HTTP ${registration.status}`);
const client = await registration.json();
assert.ok(client.client_id);
console.log("Dynamic client registration PASS");
const verifier = randomBytes(48).toString("base64url");
const state = randomBytes(24).toString("base64url");
const authorize = new URL(discovery.authorization_endpoint);
for (const [k, v] of Object.entries({
  client_id: client.client_id,
  redirect_uri: callback,
  response_type: "code",
  scope: "openid email",
  state,
  code_challenge_method: "S256",
  code_challenge: createHash("sha256").update(verifier).digest("base64url"),
  resource: "http://127.0.0.1:8787/mcp",
}))
  authorize.searchParams.set(k, v);
const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/google-chrome",
});
try {
  const page = await browser.newPage();
  await page.route(`${callback}**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain",
      body: "Local QA OAuth callback",
    }),
  );
  await page.goto(authorize.toString(), { waitUntil: "domcontentloaded" });
  await page.waitForURL(`${ui}/oauth/login**`, { timeout: 30000 });
  await page
    .getByLabel("Email", { exact: true })
    .fill("ipi1084-editor-a@ipix.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByRole("button", { name: "Allow access", exact: true })
    .waitFor({ timeout: 20000 });
  assert.ok(
    await page
      .getByText("iPix local MCP compatibility test", { exact: true })
      .count(),
  );
  await page.getByRole("button", { name: "Allow access", exact: true }).click();
  await page.waitForURL(`${callback}**`, { timeout: 15000 });
  const params = new URL(page.url()).searchParams;
  assert.equal(params.get("state"), state, "OAuth state mismatch");
  assert.ok(params.get("code"), "Missing OAuth code");
  console.log("Real QA login, consent, PKCE callback PASS");
  const exchange = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apikey: key,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: client.client_id,
      redirect_uri: callback,
      code: params.get("code"),
      code_verifier: verifier,
      resource: "http://127.0.0.1:8787/mcp",
    }),
  });
  assert.ok(exchange.ok, `Token exchange failed HTTP ${exchange.status}`);
  const session = await exchange.json();
  assert.ok(session.access_token);
  const claims = JSON.parse(
    Buffer.from(session.access_token.split(".")[1], "base64url"),
  );
  assert.equal(claims.client_id, client.client_id);
  console.log("OAuth token exchange and client binding PASS");
  const test = spawnSync(
    "deno",
    [
      "test",
      "--allow-env",
      "--allow-net=127.0.0.1:56121",
      "qa.integration.test.ts",
    ],
    {
      cwd: "supabase/functions/mcp",
      env: {
        ...process.env,
        IPIX_LOCAL_QA: "1",
        IPIX_QA_OAUTH_TOKEN: session.access_token,
        IPIX_QA_OAUTH_CLIENT_ID: client.client_id,
      },
      stdio: "inherit",
    },
  );
  assert.equal(test.status, 0, "MCP OAuth token test failed");
} finally {
  await browser.close();
}
