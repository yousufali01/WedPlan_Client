
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/hooks/use-auth";

interface Props {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: Props) {
  const router = useRouter();
  const { user, role, isPending, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isPending) return;

    if (!isAuthenticated) {
      router.replace("/signin");
      return;
    }

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      router.replace("/dashboard");
    }
  }, [
    isPending,
    isAuthenticated,
    role,
    allowedRoles,
    router,
  ]);

  if (isPending || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Checking permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
