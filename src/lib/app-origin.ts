/**
 * Origin used for OAuth callback URLs.
 *
 * Better Auth only accepts callback URLs listed in the backend's
 * `trustedOrigins` (the stable frontend domain + localhost). A phone that
 * opens the app through a Vercel preview/deployment URL would otherwise send
 * `window.location.origin` as the callback URL, get "Invalid callbackURL",
 * and end up on the backend domain instead of the app.
 */
const CANONICAL_APP_ORIGIN = "https://wedplan-client-rho.vercel.app";

export function getAppOrigin(): string {
  if (typeof window === "undefined") return CANONICAL_APP_ORIGIN;

  const { origin, hostname } = window.location;

  // Local development stays local (both are trusted by the backend).
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return origin;
  }

  // Any *.vercel.app alias/preview URL → the canonical, trusted frontend URL.
  if (hostname.endsWith(".vercel.app")) {
    return CANONICAL_APP_ORIGIN;
  }

  // Custom domains are used as-is.
  return origin;
}
