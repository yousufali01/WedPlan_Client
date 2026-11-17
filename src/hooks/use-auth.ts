
"use client";

import { authClient } from "@/lib/auth-client";

export type UserRole = "customer" | "vendor" | "admin";

export function useAuth() {
  const { data: session, isPending, error, refetch } =
    authClient.useSession();

  const user = session?.user;

  const role = (user as (typeof user & {
    role?: UserRole;
  }) | undefined)?.role;

  return {
    session,
    user,
    role,
    isPending,
    isAuthenticated: !!session,
    error,
    refetch,
  };
}
