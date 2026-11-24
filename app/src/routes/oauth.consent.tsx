import { createFileRoute } from "@tanstack/react-router";
import { isOAuthEnabled } from "@/features/ipix-oauth/environment";
import { OAuthConsent } from "@/features/ipix-oauth/oauth-consent";

export const Route = createFileRoute("/oauth/consent")({
  component: ConsentPage,
});
function ConsentPage() {
  if (!isOAuthEnabled()) {
    return (
      <main className="p-6">
        iPix OAuth is not enabled for this environment.
      </main>
    );
  }
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <OAuthConsent
        className="w-full max-w-lg"
        authorizationId={new URLSearchParams(window.location.search).get(
          "authorization_id",
        )}
        signInPath="/oauth/login"
        productName="iPix QA"
      />
    </main>
  );
}
