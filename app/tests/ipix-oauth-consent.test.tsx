import { afterAll, afterEach, beforeAll, expect, spyOn, test } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import * as clientModule from "../src/features/ipix-oauth/client";
import { useOAuthConsent } from "../src/features/ipix-oauth/use-oauth-consent";

beforeAll(() => GlobalRegistrator.register({ url: "http://127.0.0.1:4175/" }));
afterEach(() => cleanup());
afterAll(() => GlobalRegistrator.unregister());

function fixture() {
  const user = { email: "qa@example.test" };
  return {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      oauth: {
        getAuthorizationDetails: async () => ({
          data: { authorization_id: "qa", user },
          error: null,
        }),
        approveAuthorization: async () => ({
          data: null,
          error: { message: "Retry confirmed" },
        }),
        denyAuthorization: async () => ({
          data: null,
          error: { message: "Retry confirmed" },
        }),
      },
    },
  };
}
type Client = ReturnType<typeof clientModule.createClient>;

test.each(["createClient", "getUser", "getAuthorizationDetails"] as const)(
  "load rejection from %s exits loading",
  async (stage) => {
    const api = fixture();
    const reject = async (): Promise<never> => {
      throw new Error("offline");
    };
    if (stage === "getUser") api.auth.getUser = reject;
    if (stage === "getAuthorizationDetails")
      api.auth.oauth.getAuthorizationDetails = reject;
    const spy = spyOn(clientModule, "createClient").mockImplementation(() => {
      if (stage === "createClient") throw new Error("bad config");
      return api as unknown as Client;
    });
    try {
      const { result } = renderHook(() =>
        useOAuthConsent({ authorizationId: "qa" }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toContain("Unable to load authorization");
    } finally {
      cleanup();
      spy.mockRestore();
    }
  },
);

test.each(["approve", "deny"] as const)(
  "rejected %s unlocks decision and permits retry",
  async (action) => {
    const api = fixture();
    let calls = 0;
    const operation = async () => {
      calls++;
      if (calls === 1) throw new Error("offline");
      return { data: null, error: { message: "Retry confirmed" } };
    };
    api.auth.oauth.approveAuthorization = operation;
    api.auth.oauth.denyAuthorization = operation;
    const spy = spyOn(clientModule, "createClient").mockReturnValue(
      api as unknown as Client,
    );
    try {
      const { result } = renderHook(() =>
        useOAuthConsent({ authorizationId: "qa" }),
      );
      await waitFor(() => expect(result.current.details).not.toBeNull());
      await act(async () => {
        await result.current[action]();
      });
      expect(result.current.decision).toBeNull();
      expect(result.current.error).toContain("Unable to submit authorization");
      await act(async () => {
        await result.current[action]();
      });
      expect(calls).toBe(2);
      expect(result.current.error).toBe("Retry confirmed");
      expect(result.current.decision).toBeNull();
    } finally {
      cleanup();
      spy.mockRestore();
    }
  },
);
