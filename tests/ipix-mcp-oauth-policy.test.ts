import { expect, test } from "bun:test";
import {
  mcpTokenRejection,
  mcpTokenStatus,
  permitsMcpToken,
} from "../supabase/functions/mcp/oauth-policy";

const resource = "https://qa.example.test/mcp";
const client = "qa-approved-client";
const verified = {
  aud: ["authenticated", resource],
  client_id: client,
  role: "authenticated",
  is_anonymous: false,
};

const cases: [
  string,
  Parameters<typeof permitsMcpToken>[0],
  string,
  string[],
  boolean,
][] = [
  ["resource-bound approved client", verified, resource, [client], true],
  [
    "exact single resource",
    { ...verified, aud: resource },
    resource,
    [client],
    true,
  ],
  [
    "first-party token",
    { ...verified, client_id: undefined },
    resource,
    [client],
    false,
  ],
  [
    "unapproved client",
    { ...verified, client_id: "other" },
    resource,
    [client],
    false,
  ],
  [
    "generic audience",
    { ...verified, aud: "authenticated" },
    resource,
    [client],
    false,
  ],
  [
    "different resource",
    { ...verified, aud: ["authenticated", `${resource}/other`] },
    resource,
    [client],
    false,
  ],
  [
    "missing audience",
    { ...verified, aud: undefined },
    resource,
    [client],
    false,
  ],
  [
    "malformed audience",
    { ...verified, aud: [resource, 42] },
    resource,
    [client],
    false,
  ],
  ["empty config", verified, "", [client], false],
  ["empty allowlist", verified, resource, [], false],
  [
    "anonymous user",
    { ...verified, is_anonymous: true },
    resource,
    [client],
    false,
  ],
  [
    "missing anonymous claim",
    { ...verified, is_anonymous: undefined },
    resource,
    [client],
    false,
  ],
  [
    "wrong role",
    { ...verified, role: "service_role" },
    resource,
    [client],
    false,
  ],
];
cases.push([
  "generic configured audience is invalid",
  { ...verified, aud: "authenticated" },
  "authenticated",
  [client],
  false,
]);
for (const [name, claims, target, clients, expected] of cases) {
  test(name, () =>
    expect(permitsMcpToken(claims, target, clients)).toBe(expected),
  );
}

const metadata = `${resource}/oauth-protected-resource`;
test.each([
  { aud: "authenticated" },
  { aud: "https://other.example.test/mcp" },
  { aud: undefined },
  { aud: [resource, 42] },
])("wrong audience %j returns a discovery challenge", ({ aud }) => {
  const status = mcpTokenStatus({ ...verified, aud }, resource, [client]);
  expect(status).toBe(401);
  const response = mcpTokenRejection(401, metadata);
  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe(
    `Bearer error="invalid_token", resource_metadata="${metadata}"`,
  );
});

test("wrong audience takes precedence over an unapproved client", () => {
  expect(
    mcpTokenStatus(
      { ...verified, aud: "authenticated", client_id: "other" },
      resource,
      [client],
    ),
  ).toBe(401);
});
test("resource-bound but unapproved client remains forbidden", () => {
  expect(
    mcpTokenStatus({ ...verified, client_id: "other" }, resource, [client]),
  ).toBe(403);
  expect(mcpTokenRejection(403, metadata).headers.has("WWW-Authenticate")).toBe(
    false,
  );
});
test("valid resource and approved client are accepted", () => {
  expect(mcpTokenStatus(verified, resource, [client])).toBe(200);
});
test("missing configuration fails closed without an invalid token challenge", () => {
  expect(mcpTokenStatus(verified, "", [client])).toBe(503);
  expect(mcpTokenStatus(verified, resource, [])).toBe(503);
  expect(
    mcpTokenStatus({ ...verified, aud: "authenticated" }, resource, []),
  ).toBe(503);
  expect(mcpTokenRejection(503, metadata).headers.has("WWW-Authenticate")).toBe(
    false,
  );
});
test.each([`${resource}/`, `${resource}?`, `${resource}#`])(
  "noncanonical configured resource %s fails closed",
  (target) => {
    expect(mcpTokenStatus({ ...verified, aud: target }, target, [client])).toBe(
      503,
    );
  },
);
