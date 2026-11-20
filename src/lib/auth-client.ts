"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, jwtClient } from "better-auth/client/plugins";

const apiURL = process.env.NEXT_PUBLIC_API_URL;

if (!apiURL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing. Please configure your backend URL.",
  );
}

export const authClient = createAuthClient({
  baseURL: apiURL,

  fetchOptions: {
    credentials: "include",
  },

  plugins: [adminClient(), jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
