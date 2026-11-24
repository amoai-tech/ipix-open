// Build-time deployment guard, not a database authorization boundary.
// Local QA remains available. Hosted QA needs an explicitly selected origin
// and dedicated Supabase project; the existing production projects stay off.
const localProject = "http://127.0.0.1:56121";
const productionProject = "nvdlhrodvevgwdsneplk";
const productionOrigins = new Set([
  "https://ipix-open-pilot-production.up.railway.app",
  "https://ipixai-amo-agency.vercel.app",
]);

type OAuthEnvironment = {
  dev: boolean;
  origin: string;
  url?: string;
  key?: string;
  qaOrigin?: string;
  qaProjectRef?: string;
};

export function isOAuthEnvironmentEnabled(config: OAuthEnvironment): boolean {
  if (!config.key?.startsWith("sb_publishable_")) return false;
  if (config.dev && config.url === localProject) {
    return config.origin === "http://127.0.0.1:4175";
  }
  const { origin, qaOrigin, qaProjectRef, url } = config;
  if (!qaOrigin || origin !== qaOrigin || productionOrigins.has(origin))
    return false;
  if (
    !qaProjectRef ||
    !/^[a-z0-9]{20}$/.test(qaProjectRef) ||
    qaProjectRef === productionProject
  )
    return false;
  if (url !== `https://${qaProjectRef}.supabase.co`) return false;
  try {
    const parsed = new URL(qaOrigin);
    return (
      parsed.protocol === "https:" &&
      parsed.origin === qaOrigin &&
      !parsed.hostname.endsWith(".localhost") &&
      parsed.hostname !== "localhost" &&
      parsed.hostname.includes(".") &&
      !/^[\d.]+$/.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function isOAuthEnabled() {
  return isOAuthEnvironmentEnabled({
    dev: import.meta.env.DEV,
    origin: window.location.origin,
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    qaOrigin: import.meta.env.VITE_IPIX_OAUTH_QA_ORIGIN,
    qaProjectRef: import.meta.env.VITE_IPIX_OAUTH_QA_PROJECT_REF,
  });
}
