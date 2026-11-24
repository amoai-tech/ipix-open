export const safeNextPath = (
  path: unknown,
  fallback = "/",
  origin?: string,
) => {
  if (typeof path !== "string" || !path.startsWith("/")) return fallback;

  const currentOrigin = origin ?? window.location.origin;

  try {
    const url = new URL(path, currentOrigin);
    const next = `${url.pathname}${url.search}${url.hash}`;
    return url.origin === currentOrigin && !next.startsWith("//")
      ? next
      : fallback;
  } catch {
    return fallback;
  }
};
