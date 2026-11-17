import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Budget",
};

export default function BudgetPage() {
  return (
    <PagePlaceholder
      title="Budget"
      description="Plan your wedding budget, log expenses by category and watch your remaining balance update in real time. The budget tracker is coming soon."
    />
  );
}
