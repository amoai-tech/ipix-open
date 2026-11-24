// Integration test against the existing disposable loopback iPix QA stack.
// Run with the local publishable key and fixture credentials, never hosted data.
import { createClient } from "npm:@supabase/supabase-js@2.108.2";
import { createRequestHandler } from "./handler.ts";

const url = Deno.env.get("SUPABASE_URL");
const key = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
const password = Deno.env.get("IPIX_QA_FIXTURE_PASSWORD");
const resource = "http://127.0.0.1:8787/mcp";
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
Deno.test({
  name: "MCP denies first-party QA tokens and checks resource-bound OAuth when supplied",
  ignore: Deno.env.get("IPIX_LOCAL_QA") !== "1",
  async fn() {
    assert(
      url === "http://127.0.0.1:56121" &&
        typeof key === "string" &&
        key.startsWith("sb_publishable_") &&
        password,
      "Refusing non-QA configuration",
    );
    const expectedClient = Deno.env.get("IPIX_QA_OAUTH_CLIENT_ID");
    Deno.env.set("MCP_RESOURCE_URL", resource);
    Deno.env.set("MCP_ALLOWED_CLIENT_IDS", expectedClient ?? "");
    const handler = createRequestHandler({
      resourceServer: resource,
      authorizationServer: `${url}/auth/v1`,
    });
    let id = 0;
    async function call(
      method: string,
      params: Record<string, unknown> = {},
      token?: string,
    ) {
      const headers = new Headers({
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "MCP-Protocol-Version": "2025-06-18",
      });
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const response = await handler(
        new Request(resource, {
          method: "POST",
          headers,
          body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
        }),
      );
      const content = await response.text();
      const text = content.startsWith("{")
        ? content
        : content
            .split("\n")
            .find((line) => line.startsWith("data: "))
            ?.slice(6);
      return { status: response.status, body: text ? JSON.parse(text) : null };
    }
    const noAuth = await call("tools/list");
    assert(
      noAuth.status === 401,
      `No token: expected 401, got ${noAuth.status}`,
    );
    const bad = await call("tools/list", {}, "invalid-token");
    assert(
      bad.status === 401 || bad.status === 403,
      `Invalid token accepted: ${bad.status}`,
    );
    const actors: { token: string; brand: string }[] = [];
    for (const email of [
      "ipi1084-editor-a@ipix.test",
      "ipi1084-orgb@ipix.test",
    ]) {
      const client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      assert(!error && data.session, "QA fixture sign-in failed");
      const token = data.session.access_token;
      const list = await call("tools/list", {}, token);
      assert(list.status === 403, "First-party token must be denied");
      // Establish fixture truth separately via the user-scoped Data API.
      const { data: rows, error: readError } = await client
        .from("brands")
        .select("id")
        .limit(3);
      assert(!readError && rows?.length === 1, "Expected one QA fixture brand");
      actors.push({ token, brand: rows[0].id });
    }
    const oauthToken = Deno.env.get("IPIX_QA_OAUTH_TOKEN");
    if (oauthToken) {
      assert(expectedClient, "Expected OAuth client required");
      const who = await call(
        "tools/call",
        { name: "whoami", arguments: {} },
        oauthToken,
      );
      assert(
        who.status === 200,
        "Resource-bound OAuth token required; issuer compatibility gate",
      );
      assert(
        who.body?.result?.structuredContent?.client_id === expectedClient,
        "OAuth client identity mismatch",
      );
      const list = await call("tools/list", {}, oauthToken);
      const names = list.body?.result?.tools
        ?.map((t: { name: string }) => t.name)
        .sort();
      assert(
        list.status === 200 &&
          JSON.stringify(names) ===
            JSON.stringify([
              "get_brand_profile",
              "list_assets",
              "list_campaigns",
              "list_my_brands",
              "list_shoots",
              "whoami",
            ]),
        "Unexpected MCP tool list",
      );
      for (const name of ["list_campaigns", "list_shoots", "list_assets"]) {
        const reply = await call(
          "tools/call",
          { name, arguments: { limit: 3 } },
          oauthToken,
        );
        assert(
          reply.status === 200 &&
            reply.body?.result &&
            !reply.body.result.isError,
          `${name} failed`,
        );
      }
      const own = await call(
        "tools/call",
        { name: "list_my_brands", arguments: { limit: 3 } },
        oauthToken,
      );
      assert(
        own.body?.result?.structuredContent?.brands?.[0]?.id ===
          actors[0].brand,
        "OAuth own brand not found",
      );
      const foreign = await call(
        "tools/call",
        { name: "get_brand_profile", arguments: { brand_id: actors[1].brand } },
        oauthToken,
      );
      assert(
        foreign.body?.result?.isError && !foreign.body.result.structuredContent,
        "OAuth foreign brand leaked",
      );
    }
    assert(actors[0].brand !== actors[1].brand, "Distinct QA brands required");
    for (const actor of actors) {
      const denied = await call(
        "tools/call",
        {
          name: "get_brand_profile",
          arguments: { brand_id: actor.brand },
        },
        actor.token,
      );
      assert(
        denied.status === 403,
        "First-party tool execution must be denied",
      );
    }
  },
});
