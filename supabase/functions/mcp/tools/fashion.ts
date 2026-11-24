import type { McpServer } from "npm:@modelcontextprotocol/server@2.0.0";
import { z } from "npm:zod@4.4.3";
import { errorResult, jsonResult } from "./result.ts";
import type { ToolContext } from "./types.ts";

// Adapted from ipixai src/mastra/server-auth.ts and src/lib/auth/runtime-org.ts.
// Use the verified request identity, never tool arguments or model-provided org IDs.
export async function resolveMembership({ supabase, userClaims }: ToolContext) {
  if (userClaims.role !== "authenticated" || !userClaims.id) return null;
  const { data, error } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userClaims.id)
    .limit(2);
  if (error || data?.length !== 1) return null;
  return z.uuid().safeParse(data[0].org_id).success
    ? (data[0].org_id as string)
    : null;
}

const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
};
const page = z
  .object({ limit: z.number().int().min(1).max(50).default(20) })
  .strict();
const profile = z.object({ brand_id: z.uuid() }).strict();
const brandFields =
  "id,name,brand_url,intake_status,approved_profile_at,approved_profile_version";
const readFailed = () => errorResult("Unable to read authorized records.");
const denied = () => errorResult("Current organization membership required.");

export function registerFashionTools(
  server: McpServer,
  context: ToolContext,
): void {
  const { supabase, userClaims } = context;
  server.registerTool(
    "list_my_brands",
    {
      description: "List brands in the signed-in user’s current organization.",
      inputSchema: page,
      annotations: readOnly,
    },
    async ({ limit }) => {
      const org = await resolveMembership(context);
      if (!org) return denied();
      const { data, error } = await supabase
        .from("brands")
        .select(brandFields)
        .eq("org_id", org)
        .order("id")
        .limit(limit);
      return error ? readFailed() : jsonResult({ brands: data });
    },
  );
  server.registerTool(
    "get_brand_profile",
    {
      description:
        "Read authorized brand profile summary and approval metadata, excluding drafts and private fields.",
      inputSchema: profile,
      annotations: readOnly,
    },
    async ({ brand_id }) => {
      const org = await resolveMembership(context);
      if (!org) return denied();
      const { data, error } = await supabase
        .from("brands")
        .select(brandFields)
        .eq("org_id", org)
        .eq("id", brand_id)
        .maybeSingle();
      return error
        ? readFailed()
        : data
          ? jsonResult({ brand: data })
          : errorResult("Brand not available.");
    },
  );
  server.registerTool(
    "list_campaigns",
    {
      description: "List campaign summaries in the current organization.",
      inputSchema: page,
      annotations: readOnly,
    },
    async ({ limit }) => {
      const org = await resolveMembership(context);
      if (!org) return denied();
      const { data, error } = await supabase
        .from("campaigns")
        .select("id,name,brand_id,status,start_date,end_date")
        .eq("org_id", org)
        .order("id")
        .limit(limit);
      return error ? readFailed() : jsonResult({ campaigns: data });
    },
  );
  server.registerTool(
    "list_shoots",
    {
      description:
        "List legacy shoot bookings owned by the signed-in designer; not all organization shoots.",
      inputSchema: page,
      annotations: readOnly,
    },
    async ({ limit }) => {
      if (!(await resolveMembership(context))) return denied();
      // Legacy bookings are personal, not organization-owned: the QA schema has
      // designer_id but no org_id, and SELECT RLS is auth.uid() = designer_id.
      // This is not a canonical Planner shoot reader (IPI-1494).
      const { data, error } = await supabase
        .from("shoots")
        .select(
          "id,shoot_type,scheduled_date,scheduled_time,status,looks_count",
        )
        .eq("designer_id", userClaims.id)
        .order("id")
        .limit(limit);
      return error ? readFailed() : jsonResult({ shoots: data });
    },
  );
  server.registerTool(
    "list_assets",
    {
      description:
        "List authorized asset metadata for brands in the current organization, not media URLs.",
      inputSchema: page,
      annotations: readOnly,
    },
    async ({ limit }) => {
      const org = await resolveMembership(context);
      if (!org) return denied();
      const { data, error } = await supabase
        .from("assets")
        .select(
          "id,brand_id,asset_type,status,width,height,brands!inner(org_id)",
        )
        .eq("brands.org_id", org)
        .order("id")
        .limit(limit);
      return error
        ? readFailed()
        : jsonResult({
            assets: data?.map(({ brands: _brands, ...asset }) => asset),
          });
    },
  );
}
