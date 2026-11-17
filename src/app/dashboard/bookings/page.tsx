import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Bookings",
};

export default function BookingsPage() {
  return (
    <PagePlaceholder
      title="Bookings"
      description="Review your confirmed vendor bookings, pending quotes and payment status in one place. The bookings manager is coming soon."
    />
  );
}
