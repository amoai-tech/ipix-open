// Offline contract test of the actual pinned metadata middleware, not a live Auth proof.
import { pipeline } from "npm:@supabase/middleware@1";
import { withOAuthProtectedResource } from "npm:@supabase/server@1";
import { createRequestHandler } from "./handler.ts";
import { mcpTokenRejection, mcpTokenStatus } from "./oauth-policy.ts";

Deno.test("MCP challenge points to SDK discovery and preserves authorization denial", async () => {
  const resource = "https://qa.example.test/mcp";
  const authorizationServer = "https://auth.example.test/auth/v1";
  const metadata = `${resource}/oauth-protected-resource`;
  const client = "approved-client";
  const handler = pipeline(
    [
      withOAuthProtectedResource({
        resourceServer: resource,
        authorizationServer,
      }),
    ],
    (_request, ctx) => {
      const status = mcpTokenStatus(
        {
          aud: "authenticated",
          client_id: client,
          role: "authenticated",
          is_anonymous: false,
        },
        resource,
        [client],
      );
      if (status === 200)
        throw new Error("Wrong audience reached the protected handler");
      return Promise.resolve(
        mcpTokenRejection(
          status,
          ctx.oauthProtectedResource.resourceMetadataUrl,
        ),
      );
    },
  );
  const denied = await handler(new Request(resource, { method: "POST" }));
  if (
    denied.status !== 401 ||
    denied.headers.get("WWW-Authenticate") !==
      `Bearer error="invalid_token", resource_metadata="${metadata}"`
  ) {
    throw new Error("Missing or incorrect reauthorization challenge");
  }
  const discovery = await handler(new Request(metadata));
  const doc = await discovery.json();
  if (
    discovery.status !== 200 ||
    doc.resource !== resource ||
    doc.authorization_servers?.[0] !== authorizationServer
  ) {
    throw new Error(
      "Challenge does not point to the expected discovery document",
    );
  }
});

// Isolated verifier contract: ephemeral signing key and synthetic claims only.
// No real project, network, user credentials, or token issuance is involved.
Deno.test("MCP verifies configured issuer before accepting a signed OAuth token", async () => {
  const issuer = "https://auth.example.test/auth/v1";
  const resource = "https://qa.example.test/mcp";
  const keys = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const publicKey = await crypto.subtle.exportKey("jwk", keys.publicKey);
  const config = {
    SUPABASE_URL: "https://auth.example.test",
    SUPABASE_PUBLIC_URL: "https://auth.example.test",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_only",
    SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({
      default: "sb_publishable_test_only",
    }),
    SUPABASE_JWKS: JSON.stringify({
      keys: [{ ...publicKey, kid: "offline-test", alg: "ES256", use: "sig" }],
    }),
    MCP_AUTH_ISSUER: issuer,
    MCP_RESOURCE_URL: resource,
    MCP_ALLOWED_CLIENT_IDS: "approved-client",
  };
  const previous = Object.keys(config).map(
    (key) => [key, Deno.env.get(key)] as const,
  );
  const encode = (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
  const json = (value: unknown) =>
    encode(new TextEncoder().encode(JSON.stringify(value)));
  const signed = async (iss?: string) => {
    const input = `${json({ alg: "ES256", kid: "offline-test", typ: "JWT" })}.${json(
      {
        iss,
        sub: "11111111-1111-4111-8111-111111111111",
        aud: resource,
        exp: Math.floor(Date.now() / 1000) + 60,
        role: "authenticated",
        client_id: "unapproved-client",
        is_anonymous: false,
      },
    )}`;
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      keys.privateKey,
      new TextEncoder().encode(input),
    );
    return `${input}.${encode(new Uint8Array(signature))}`;
  };
  try {
    for (const [key, value] of Object.entries(config)) Deno.env.set(key, value);
    const handler = createRequestHandler({ resourceServer: resource });
    const metadata = await handler(
      new Request(`${resource}/oauth-protected-resource`),
    );
    if (
      metadata.status !== 200 ||
      (await metadata.json()).authorization_servers?.[0] !== issuer
    )
      throw new Error("Discovery issuer differs from verifier issuer");
    for (const [label, claim, expected] of [
      ["trusted issuer", issuer, 403],
      ["wrong issuer", "https://other.example.test/auth/v1", 401],
      ["missing issuer", undefined, 401],
    ] as const) {
      const token = await signed(claim);
      const response = await handler(
        new Request(resource, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
        }),
      );
      if (response.status !== expected)
        throw new Error(
          `${label}: expected ${expected}, received ${response.status}`,
        );
      await response.body?.cancel();
    }
    Deno.env.set("MCP_AUTH_ISSUER", "not-an-issuer");
    const invalid = await createRequestHandler()(new Request(resource));
    if (invalid.status !== 503)
      throw new Error("Invalid issuer must fail closed");
    await invalid.body?.cancel();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) Deno.env.delete(key);
      else Deno.env.set(key, value);
    }
  }
});
