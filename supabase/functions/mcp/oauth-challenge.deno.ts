// Offline contract test of the actual pinned metadata middleware, not a live Auth proof.
import { pipeline } from "npm:@supabase/middleware@1";
import { withOAuthProtectedResource } from "npm:@supabase/server@1";
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
