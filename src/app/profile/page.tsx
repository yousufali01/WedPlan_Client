import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default function ProfilePage() {
  return (
    <PagePlaceholder
      title="Profile Settings"
      description="Update your name, email and password here. This page will be protected so only signed-in users can view it."
    />
  );
}
