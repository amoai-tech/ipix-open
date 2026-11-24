import "jsr:@supabase/functions-js@2.108.2/edge-runtime.d.ts";

import {
  createMcpHandler,
  McpServer,
} from "npm:@modelcontextprotocol/server@2.0.0";
import { pipeline } from "npm:@supabase/middleware@1";
import {
  type SupabaseContext,
  withOAuthProtectedResource,
  withSupabase,
} from "npm:@supabase/server@1";

import { permitsMcpToken } from "./oauth-policy.ts";
import { registerTools, type ToolContext } from "./tools/index.ts";

// An MCP server as a single Supabase Edge Function, composed as a pipeline:
//
//   withOAuthProtectedResource  OAuth discovery for external MCP clients. Runs
//                               before the auth gate so unauthenticated clients
//                               can fetch the RFC 9728 metadata, and adds the
//                               WWW-Authenticate challenge to the gate's 401.
//   withSupabase                Verifies the user access token and builds an
//                               RLS-scoped client, so both embedded product
//                               agents and external OAuth clients act as the
//                               signed-in user.
//   handleMcp                   MCP transport and tools (./tools/index.ts).
//
// On Supabase Edge Functions the public URLs in the OAuth metadata are derived
// automatically, locally and hosted. Off Edge Functions, pass `resourceServer`
// and `authorizationServer` to withOAuthProtectedResource.

function readTextEnv(name: string, fallback: string): string {
  return Deno.env.get(name)?.trim() || fallback;
}

const SERVER_NAME = readTextEnv("MCP_SERVER_NAME", "ipix-mcp");
const SERVER_DESCRIPTION = readTextEnv(
  "MCP_SERVER_DESCRIPTION",
  "MCP access to this Supabase project for the signed-in user.",
);

const SERVER_INSTRUCTIONS =
  `${SERVER_DESCRIPTION} ` +
  "Every tool runs as the signed-in Supabase user, so role grants and Row Level Security apply. " +
  "Call tools/list to discover what this project exposes, and read a tool's description and " +
  "annotations before calling it. The fashion tools are read-only.";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Mcp-Method, Mcp-Name",
  "Access-Control-Expose-Headers": "WWW-Authenticate, Mcp-Session-Id",
};

function createServer(context: ToolContext): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: "1.0.0" },
    { instructions: SERVER_INSTRUCTIONS },
  );

  registerTools(server, context);
  return server;
}

async function handleMcp(
  request: Request,
  ctx: SupabaseContext,
): Promise<Response> {
  const { userClaims, jwtClaims } = ctx;
  if (!userClaims || !jwtClaims) {
    return new Response("Unauthorized", { status: 401 });
  }
  // No first-party tokens or unapproved OAuth clients. Fail closed until the
  // issuer can mint a signed resource audience and deployment config is reviewed.
  const resource = readTextEnv("MCP_RESOURCE_URL", "");
  const allowedClients = readTextEnv("MCP_ALLOWED_CLIENT_IDS", "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!permitsMcpToken(jwtClaims, resource, allowedClients)) {
    return new Response("Forbidden", { status: 403 });
  }
  // The server and its tools are bound to this caller for exactly one request.
  const handler = createMcpHandler(
    () =>
      createServer({
        supabase: ctx.supabase,
        userClaims,
        jwtClaims,
      }),
    { onerror: (error) => console.error("MCP request failed", error) },
  );

  return handler.fetch(request);
}

// Keep the default Edge metadata behavior. Explicit URLs are used only by the isolated test harness.
export function createRequestHandler(
  oauth?: Parameters<typeof withOAuthProtectedResource>[0],
) {
  return pipeline(
    [
      withOAuthProtectedResource(oauth),
      withSupabase({ auth: "user", cors: { headers: CORS_HEADERS } }),
    ],
    (request, ctx) => handleMcp(request, ctx),
  );
}
