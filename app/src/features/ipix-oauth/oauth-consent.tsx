"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type OAuthConsentDecision,
  useOAuthConsent,
} from "./use-oauth-consent";

const getInitial = (value: string) =>
  value.trim().charAt(0).toUpperCase() || "?";

interface ConsentCardShellProps extends React.ComponentPropsWithoutRef<"div"> {
  clientName: string;
  productName: string;
}

function ConsentCardShell({
  clientName,
  productName,
  className,
  children,
  ...props
}: ConsentCardShellProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <section className="rounded-xl border bg-background p-6">
        <header className="items-center space-y-4 text-center">
          <div
            className="flex items-center justify-center"
            role="img"
            aria-label={`${clientName} connecting to ${productName}`}
          >
            <div className="flex size-12 items-center justify-center rounded-full border bg-muted font-medium">
              {getInitial(clientName)}
            </div>
            <div className="h-px w-8 bg-border" aria-hidden="true" />
            <div className="flex size-12 items-center justify-center rounded-full border bg-muted font-medium">
              {getInitial(productName)}
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="font-medium text-lg tracking-normal">
              Authorize {clientName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Review what this client gets access to.
            </p>
          </div>
        </header>
        <div className="mt-6 space-y-6">{children}</div>
      </section>
    </div>
  );
}

export interface OAuthConsentCardProps
  extends React.ComponentPropsWithoutRef<"div"> {
  clientName: string;
  productName?: string;
  redirectUri: string;
  email: string;
  scopes?: string[];
  error?: string | null;
  decision?: OAuthConsentDecision | null;
  onApprove?: () => void;
  onDeny?: () => void;
}

export function OAuthConsentCard({
  clientName,
  productName = "Your product",
  redirectUri,
  email,
  scopes = [],
  error = null,
  decision = null,
  onApprove,
  onDeny,
  ...props
}: OAuthConsentCardProps) {
  return (
    <ConsentCardShell
      clientName={clientName}
      productName={productName}
      {...props}
    >
      <dl className="divide-y rounded-lg border text-sm">
        <div className="flex items-center justify-between gap-6 p-4">
          <dt className="text-muted-foreground">Client</dt>
          <dd className="min-w-0 break-all text-right font-medium">
            {clientName}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6 p-4">
          <dt className="text-muted-foreground">Redirects to</dt>
          <dd className="min-w-0 break-all text-right font-medium">
            {redirectUri}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6 p-4">
          <dt className="text-muted-foreground">Signed in as</dt>
          <dd className="min-w-0 break-all text-right font-medium">{email}</dd>
        </div>
        {scopes.length > 0 && (
          <div className="flex items-center justify-between gap-6 p-4">
            <dt className="text-muted-foreground">Scopes</dt>
            <dd className="min-w-0 break-all text-right font-medium">
              {scopes.join(", ")}
            </dd>
          </div>
        )}
      </dl>
      <p className="text-sm text-muted-foreground">
        Allow access only if you recognize this application. iPix MCP tools read
        authorized brand, campaign, shoot and asset summaries. The OAuth
        identity scopes are not a database permission boundary.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={decision !== null}
          onClick={onDeny}
        >
          {decision === "deny" ? "Denying..." : "Deny"}
        </Button>
        <Button type="button" disabled={decision !== null} onClick={onApprove}>
          {decision === "approve" ? "Allowing..." : "Allow access"}
        </Button>
      </div>
    </ConsentCardShell>
  );
}

interface OAuthConsentProps extends React.ComponentPropsWithoutRef<"div"> {
  authorizationId?: string | null;
  signInPath?: string;
  productName?: string;
}

export function OAuthConsent({
  authorizationId,
  signInPath = "/auth/login",
  productName = "Your product",
  ...props
}: OAuthConsentProps) {
  const { details, email, error, isLoading, decision, approve, deny } =
    useOAuthConsent({
      authorizationId,
      signInPath,
    });

  if (isLoading || !details || !email) {
    return (
      <ConsentCardShell
        clientName="OAuth client"
        productName={productName}
        {...props}
      >
        {isLoading ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading authorization request...
          </p>
        ) : (
          <p role="alert" className="text-sm text-destructive">
            {error ??
              "Unable to load the authorization request. Start again from your OAuth client."}
          </p>
        )}
      </ConsentCardShell>
    );
  }

  return (
    <OAuthConsentCard
      clientName={details.client.name}
      productName={productName}
      redirectUri={details.redirect_uri}
      email={email}
      scopes={details.scope.split(" ").filter(Boolean)}
      error={error}
      decision={decision}
      onApprove={() => void approve()}
      onDeny={() => void deny()}
      {...props}
    />
  );
}
