import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CircleDollarSign, ListChecks } from "lucide-react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Dashboard",
};

const sections = [
  {
    title: "Budget",
    description: "Track spending against your plan, category by category.",
    icon: CircleDollarSign,
  },
  {
    title: "Checklist",
    description: "Keep every planning task on schedule, month by month.",
    icon: ListChecks,
  },
  {
    title: "Bookings",
    description: "See confirmed vendor bookings and pending quotes at a glance.",
    icon: CalendarCheck,
  },
] as const;

export default function DashboardPage() {
  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="w-fit rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Planning overview
        </span>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Your wedding, beautifully organized
        </h1>
        <p className="max-w-lg text-balance text-muted-foreground">
          Budget tracking, your planning checklist and vendor bookings will all
          appear here. Start by exploring the services on offer.
        </p>
        <Link
          href={siteConfig.routes.services}
          className="mt-1 w-fit inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Browse Services
        </Link>
      </header>

      {/* Shell placeholders — each feature module replaces one card with real UI */}
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <span className="mt-auto w-fit rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
