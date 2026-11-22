"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, jwtClient } from "better-auth/client/plugins";

/**
 * Auth requests deliberately stay on the SAME ORIGIN as the frontend.
 * `next.config.ts` rewrites `/api/auth/*` to the Express backend, so:
 *  - the session cookie is first-party (mobile Safari / in-app browsers block
 *    third-party cookies, which broke sign-in on phones), and
 *  - any auth redirect lands back on the frontend instead of sending the
 *    browser to the backend root ("Welcome to WedPlan Server!").
 *
 * Do not set `baseURL` to NEXT_PUBLIC_API_URL here — that points at the
 * backend domain and is what caused the mobile redirect bug.
 */
export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },

  plugins: [adminClient(), jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
