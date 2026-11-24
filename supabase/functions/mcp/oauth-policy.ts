// Called only with claims verified by Supabase middleware.
// Generic Supabase user audiences are not MCP resource audiences.
export function permitsMcpToken(
  claims: {
    aud?: unknown;
    client_id?: unknown;
    role?: unknown;
    is_anonymous?: unknown;
  },
  resource: string,
  allowedClients: readonly string[],
): boolean {
  // Reject malformed configuration as well as generic audience strings.
  let target: URL;
  try {
    target = new URL(resource);
  } catch {
    return false;
  }
  if (
    (target.protocol !== "https:" &&
      !(target.protocol === "http:" && target.hostname === "127.0.0.1")) ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    !resource ||
    !allowedClients.length ||
    claims.role !== "authenticated" ||
    claims.is_anonymous !== false ||
    typeof claims.client_id !== "string" ||
    !allowedClients.includes(claims.client_id)
  )
    return false;
  const audiences = typeof claims.aud === "string" ? [claims.aud] : claims.aud;
  return (
    Array.isArray(audiences) &&
    audiences.every((a) => typeof a === "string") &&
    audiences.includes(resource)
  );
}
