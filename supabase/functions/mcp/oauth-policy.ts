// Called only with claims verified by Supabase middleware.
// Generic Supabase user audiences are not MCP resource audiences.
type TokenClaims = {
  aud?: unknown;
  client_id?: unknown;
  role?: unknown;
  is_anonymous?: unknown;
};

// The installed metadata middleware strips trailing slashes and encodes quotes.
// Require the configured audience to use the same canonical spelling.
export function isValidMcpResource(resource: string): boolean {
  try {
    const target = new URL(resource);
    return (
      (target.protocol === "https:" ||
        (target.protocol === "http:" && target.hostname === "127.0.0.1")) &&
      !target.username &&
      !target.password &&
      !target.search &&
      !target.hash &&
      !resource.endsWith("/") &&
      !/[?#"\\]/.test(resource) &&
      (target.href === resource || target.href === `${resource}/`)
    );
  } catch {
    return false;
  }
}

export function mcpTokenStatus(
  claims: TokenClaims,
  resource: string,
  allowedClients: readonly string[],
): 200 | 401 | 403 | 503 {
  if (!isValidMcpResource(resource) || !allowedClients.length) return 503;
  const audiences = typeof claims.aud === "string" ? [claims.aud] : claims.aud;
  if (
    !Array.isArray(audiences) ||
    !audiences.every((a) => typeof a === "string") ||
    !audiences.includes(resource)
  )
    return 401;
  if (
    claims.role !== "authenticated" ||
    claims.is_anonymous !== false ||
    typeof claims.client_id !== "string" ||
    !allowedClients.includes(claims.client_id)
  )
    return 403;
  return 200;
}

export function permitsMcpToken(
  claims: TokenClaims,
  resource: string,
  allowedClients: readonly string[],
): boolean {
  return mcpTokenStatus(claims, resource, allowedClients) === 200;
}

// The metadata URL is contributed by withOAuthProtectedResource, not the caller.
export function mcpTokenRejection(
  status: 401 | 403 | 503,
  resourceMetadataUrl: string,
): Response {
  if (status === 401) {
    return new Response("Unauthorized", {
      status,
      headers: {
        "WWW-Authenticate": `Bearer error="invalid_token", resource_metadata="${resourceMetadataUrl}"`,
      },
    });
  }
  return new Response(status === 403 ? "Forbidden" : "Service unavailable", {
    status,
  });
}
