import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

// Keep this session separate from OpenBot Better Auth. QA only until the identity
// and workspace-isolation gates pass. Never accept a secret/service-role key.
let client: SupabaseClient | undefined;
export function createClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (
    !import.meta.env.DEV ||
    url !== "http://127.0.0.1:56121" ||
    !key?.startsWith("sb_publishable_")
  ) {
    throw new Error(
      "iPix OAuth is disabled outside the isolated QA environment.",
    );
  }
  client ??= createSupabaseClient(url, key, {
    auth: { storageKey: "ipix-qa-oauth-session", flowType: "pkce" },
  });
  return client;
}
