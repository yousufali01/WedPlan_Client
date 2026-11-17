
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, role, isPending, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isPending) return;

    if (!isAuthenticated) {
      router.replace("/signin");
      return;
    }

    if (!user) return;

    if (role === "admin") {
      router.replace("/admin/dashboard");
    } else if (role === "vendor") {
      router.replace("/vendor/dashboard");
    } else if (role === "customer") {
      router.replace("/dashboard");
    }
  }, [isPending, isAuthenticated, user, role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Completing your sign in...</p>
    </div>
  );
}
