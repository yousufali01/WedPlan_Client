"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export type UserRole = "customer" | "vendor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  vendorApproved?: boolean;
};

export function useAuth() {
  const router = useRouter();
  const { data: session, isPending, error, refetch } = authClient.useSession();

  const rawUser = session?.user;

  const user = React.useMemo<AuthUser | null>(() => {
    if (!rawUser) return null;

    const typed = rawUser as typeof rawUser & {
      role?: string;
      vendorApproved?: boolean;
    };

    const role: UserRole =
      typed.role === "admin"
        ? "admin"
        : typed.role === "vendor"
          ? "vendor"
          : "customer";

    return {
      id: rawUser.id,
      name: rawUser.name || rawUser.email,
      email: rawUser.email,
      image: rawUser.image ?? null,
      avatarUrl: rawUser.image ?? null,
      role,
      vendorApproved: Boolean(typed.vendorApproved),
    };
  }, [rawUser]);

  const signOut = React.useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      router.push("/");
      router.refresh();
    }
  }, [router]);

  return {
    session,
    user,
    role: user?.role ?? null,
    isPending,
    isAuthenticated: Boolean(user),
    error,
    refetch,
    signOut,
  };
}
