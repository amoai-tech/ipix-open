import { expect, test } from "bun:test";
import { isOAuthEnvironmentEnabled } from "../src/features/ipix-oauth/environment";

const qaProjectRef = "abcdefghijklmnopqrst";
const qaOrigin = "https://ipix-qa.example.test";
const hosted = {
  dev: false,
  origin: qaOrigin,
  qaOrigin,
  qaProjectRef,
  url: `https://${qaProjectRef}.supabase.co`,
  key: "sb_publishable_test",
};
test("explicit HTTPS hosted QA with matching project is allowed", () => {
  expect(isOAuthEnvironmentEnabled(hosted)).toBe(true);
});
test("existing loopback QA is allowed in development", () => {
  expect(
    isOAuthEnvironmentEnabled({
      dev: true,
      origin: "http://127.0.0.1:4175",
      url: "http://127.0.0.1:56121",
      key: hosted.key,
    }),
  ).toBe(true);
});
test.each([
  { qaOrigin: undefined },
  { qaProjectRef: undefined },
  { origin: "https://wrong.example.test" },
  { url: "https://wrong.supabase.co" },
  { key: "sb_secret_test" },
  { key: undefined },
  {
    qaProjectRef: "nvdlhrodvevgwdsneplk",
    url: "https://nvdlhrodvevgwdsneplk.supabase.co",
  },
  {
    origin: "https://ipix-open-pilot-production.up.railway.app",
    qaOrigin: "https://ipix-open-pilot-production.up.railway.app",
  },
  {
    origin: "https://ipixai-amo-agency.vercel.app",
    qaOrigin: "https://ipixai-amo-agency.vercel.app",
  },
  { origin: "http://qa.example.test", qaOrigin: "http://qa.example.test" },
  {
    origin: "https://qa.example.test/path",
    qaOrigin: "https://qa.example.test/path",
  },
  { origin: "https://127.0.0.1", qaOrigin: "https://127.0.0.1" },
  { url: "http://127.0.0.1:56121", origin: "http://127.0.0.1:4175" },
])("fails closed on invalid or production config %#", (overrides) => {
  expect(isOAuthEnvironmentEnabled({ ...hosted, ...overrides })).toBe(false);
});
