import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Checklist",
};

export default function ChecklistPage() {
  return (
    <PagePlaceholder
      title="Checklist"
      description="A step-by-step wedding checklist that keeps every task — from booking the venue to the final dress fitting — on schedule. Coming soon."
    />
  );
}
