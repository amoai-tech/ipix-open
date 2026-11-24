import { expect, test } from "bun:test";
import { permitsMcpToken } from "../supabase/functions/mcp/oauth-policy";

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
