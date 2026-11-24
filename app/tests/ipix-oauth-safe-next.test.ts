import { describe, expect, test } from "bun:test";
import { safeNextPath } from "../src/features/ipix-oauth/safe-next-path";

describe("iPix OAuth return path", () => {
  const origin = "http://127.0.0.1:4175";
  const fallback = "/oauth/consent";
  test("preserves the local consent request", () => {
    expect(
      safeNextPath(
        "/oauth/consent?authorization_id=qa#review",
        fallback,
        origin,
      ),
    ).toBe("/oauth/consent?authorization_id=qa#review");
  });
  test.each([
    null,
    "",
    "https://external.example",
    "//external.example",
    "/\\external.example",
    "/a/..//external.example",
  ])("rejects an unsafe or ambiguous return path: %s", (path) =>
    expect(safeNextPath(path, fallback, origin)).toBe(fallback),
  );
});
