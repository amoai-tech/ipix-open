import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/features/ipix-oauth/client";
import { safeNextPath } from "@/features/ipix-oauth/safe-next-path";

export const Route = createFileRoute("/oauth/login")({ component: LoginPage });
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const next = safeNextPath(
      new URLSearchParams(window.location.search).get("next"),
      "/oauth/consent",
    );
    if (new URL(next, window.location.origin).pathname !== "/oauth/consent") {
      setError("Invalid consent destination.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError("Sign-in failed. Check your QA account.");
      else window.location.assign(next);
    } catch {
      setError("QA authentication is unavailable.");
    } finally {
      setBusy(false);
      setPassword("");
    }
  }
  if (
    !import.meta.env.DEV ||
    import.meta.env.VITE_SUPABASE_URL !== "http://127.0.0.1:56121"
  )
    return (
      <main className="p-6">
        iPix OAuth is not enabled for this environment.
      </main>
    );
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <form
        className="w-full max-w-sm space-y-4 rounded-xl border p-6"
        onSubmit={submit}
      >
        <h1 className="text-xl font-medium">Sign in to iPix QA</h1>
        <p className="text-sm text-muted-foreground">
          Use an existing Supabase QA account. This is separate from your
          OpenBot login.
        </p>
        <label htmlFor="ipix-oauth-email" className="block space-y-2">
          Email
          <Input
            id="ipix-oauth-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label htmlFor="ipix-oauth-password" className="block space-y-2">
          Password
          <Input
            id="ipix-oauth-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button disabled={busy} type="submit">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
