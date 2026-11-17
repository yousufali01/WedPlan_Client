import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <PagePlaceholder
      title="Sign In"
      description="Welcome back! The sign-in form will live here in the authentication task."
      cta={{ href: "/signup", label: "Need an account? Sign Up" }}
    />
  );
}
