import {
  afterAll,
  afterEach,
  beforeAll,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";
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
    const selected = mock(operation);
    const unselected = mock(async () => ({
      data: null,
      error: { message: "Unexpected decision" },
    }));
    api.auth.oauth.approveAuthorization =
      action === "approve" ? selected : unselected;
    api.auth.oauth.denyAuthorization =
      action === "deny" ? selected : unselected;
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
      expect(selected).toHaveBeenCalledTimes(2);
      expect(selected).toHaveBeenCalledWith("qa", {
        skipBrowserRedirect: true,
      });
      expect(unselected).not.toHaveBeenCalled();
      expect(result.current.error).toBe("Retry confirmed");
      expect(result.current.decision).toBeNull();
    } finally {
      cleanup();
      spy.mockRestore();
    }
  },
);

test.each(["success", "error", "throw"] as const)(
  "stale %s decision cannot navigate or unlock a newer authorization",
  async (outcome) => {
    const api = fixture();
    const user = { email: "qa@example.test" };
    api.auth.oauth.getAuthorizationDetails = async (id?: string) => ({
      data: { authorization_id: id ?? "qa", user },
      error: null,
    });
    type Reply = {
      data: { redirect_url: string } | null;
      error: { message: string } | null;
    };
    let finishA!: (reply: Reply) => void;
    let failA!: (error: Error) => void;
    let finishB!: (reply: Reply) => void;
    const pendingA = new Promise<Reply>((resolve, reject) => {
      finishA = resolve;
      failA = reject;
    });
    const pendingB = new Promise<Reply>((resolve) => {
      finishB = resolve;
    });
    // Supabase's actual return type includes both success and error results.
    const approve = mock((id: string) => (id === "a" ? pendingA : pendingB));
    const spy = spyOn(clientModule, "createClient").mockReturnValue({
      auth: {
        ...api.auth,
        oauth: { ...api.auth.oauth, approveAuthorization: approve },
      },
    } as unknown as Client);
    const assign = window.location.assign;
    const navigate = mock((_url: string | URL) => {});
    window.location.assign = navigate;
    try {
      const { result, rerender } = renderHook(
        ({ id }: { id: string }) => useOAuthConsent({ authorizationId: id }),
        { initialProps: { id: "a" } },
      );
      await waitFor(() =>
        expect(result.current.details?.authorization_id).toBe("a"),
      );
      let a!: Promise<void>;
      act(() => {
        a = result.current.approve();
      });
      rerender({ id: "b" });
      await waitFor(() =>
        expect(result.current.details?.authorization_id).toBe("b"),
      );
      let b!: Promise<void>;
      act(() => {
        b = result.current.approve();
      });
      expect(result.current.decision).toBe("approve");
      await act(async () => {
        if (outcome === "throw") failA(new Error("stale failure"));
        else
          finishA(
            outcome === "success"
              ? {
                  data: { redirect_url: "https://example.invalid/stale" },
                  error: null,
                }
              : { data: null, error: { message: "stale error" } },
          );
        await a;
      });
      expect(navigate).not.toHaveBeenCalled();
      expect(result.current.error).toBeNull();
      expect(result.current.decision).toBe("approve");
      await act(async () => {
        await result.current.approve();
      });
      expect(approve).toHaveBeenCalledTimes(2);
      await act(async () => {
        finishB({
          data: { redirect_url: "https://example.invalid/current" },
          error: null,
        });
        await b;
      });
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith("https://example.invalid/current");
    } finally {
      window.location.assign = assign;
      cleanup();
      spy.mockRestore();
    }
  },
);
