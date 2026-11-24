// Local-only OAuth compatibility proof for the actual Supabase consent route.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { chromium } from "playwright-core";

const origin = "http://127.0.0.1:56121";
const ui = "http://127.0.0.1:4175";
const callback = `${ui}/oauth/test-callback`;
const resource = "http://127.0.0.1:8787/mcp";
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
const password = process.env.IPIX_QA_FIXTURE_PASSWORD;
assert.ok(
  process.env.SUPABASE_URL === origin &&
    key?.startsWith("sb_publishable_") &&
    password,
  "Refusing non-QA configuration or missing fixture credentials",
);
const discovery = await fetch(
  `${origin}/auth/v1/.well-known/oauth-authorization-server`,
  { redirect: "error" },
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
  redirect: "error",
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
// Separate browser contexts prevent one user's cookies or consent from
// being mistaken for the other user's. No tokens or callback URLs are logged.
async function tokenRequest(parameters) {
  return fetch(discovery.token_endpoint, {
    method: "POST",
    redirect: "error",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apikey: key,
    },
    body: new URLSearchParams({ client_id: client.client_id, ...parameters }),
  });
}

async function authorizeActor(browser, email, label) {
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
    resource,
  }))
    authorize.searchParams.set(k, v);

  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.route(`${callback}**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: "Local QA OAuth callback",
      }),
    );
    await page.goto(authorize.toString(), { waitUntil: "domcontentloaded" });
    await page.waitForURL(`${ui}/oauth/login**`, { timeout: 30000 });
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page
      .getByRole("button", { name: "Allow access", exact: true })
      .waitFor({ timeout: 20000 });
    assert.ok(
      await page
        .getByText("iPix local MCP compatibility test", { exact: true })
        .count(),
      "Expected client consent screen",
    );
    await page
      .getByRole("button", { name: "Allow access", exact: true })
      .click();
    await page.waitForURL(`${callback}**`, { timeout: 15000 });
    const params = new URL(page.url()).searchParams;
    assert.ok(params.get("state") === state, "OAuth state mismatch");
    assert.ok(params.get("code"), "Missing OAuth code");
    console.log(
      `Actor ${label}: real QA login, consent and PKCE callback PASS`,
    );

    const exchange = await tokenRequest({
      grant_type: "authorization_code",
      redirect_uri: callback,
      code: params.get("code"),
      code_verifier: verifier,
      resource,
    });
    assert.ok(exchange.ok, `Token exchange failed HTTP ${exchange.status}`);
    const initial = await exchange.json();
    assert.ok(
      typeof initial.access_token === "string" &&
        initial.access_token &&
        typeof initial.refresh_token === "string" &&
        initial.refresh_token,
      "Missing OAuth access/refresh token",
    );

    // Per the documented public-client refresh flow, omit resource to test
    // whether the original authorization survives refresh.
    const refresh = await tokenRequest({
      grant_type: "refresh_token",
      refresh_token: initial.refresh_token,
    });
    assert.ok(refresh.ok, `Token refresh failed HTTP ${refresh.status}`);
    const renewed = await refresh.json();
    assert.ok(
      typeof renewed.access_token === "string" && renewed.access_token,
      "Missing refreshed access token",
    );
    console.log(
      `Actor ${label}: issuance and refresh returned tokens; verification pending`,
    );

    // A resource not granted by consent must not be newly authorized on refresh.
    const changedResource = await tokenRequest({
      grant_type: "refresh_token",
      refresh_token: renewed.refresh_token ?? initial.refresh_token,
      resource: `${resource}/other`,
    });
    const rejection = await changedResource.json();
    assert.ok(
      changedResource.status === 400 &&
        rejection.error === "invalid_target" &&
        !rejection.access_token,
      "Issuer must reject a changed refresh resource with invalid_target",
    );
    console.log(`Actor ${label}: wrong-resource refresh denied PASS`);

    return { initial: initial.access_token, refreshed: renewed.access_token };
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/google-chrome",
});
try {
  const a = await authorizeActor(browser, "ipi1084-editor-a@ipix.test", "A");
  const b = await authorizeActor(browser, "ipi1084-orgb@ipix.test", "B");
  const test = spawnSync("deno", ["task", "test:qa"], {
    cwd: "supabase/functions/mcp",
    env: {
      ...process.env,
      IPIX_LOCAL_QA: "1",
      IPIX_QA_REQUIRE_OAUTH: "1",
      IPIX_QA_OAUTH_CLIENT_ID: client.client_id,
      IPIX_QA_OAUTH_TOKEN_A: a.initial,
      IPIX_QA_OAUTH_REFRESHED_A: a.refreshed,
      IPIX_QA_OAUTH_TOKEN_B: b.initial,
      IPIX_QA_OAUTH_REFRESHED_B: b.refreshed,
    },
    stdio: "inherit",
  });
  assert.ok(
    test.status === 0,
    "MCP OAuth issuance/refresh and two-user test failed",
  );
} finally {
  await browser.close();
}
