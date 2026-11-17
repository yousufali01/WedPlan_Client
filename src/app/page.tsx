import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
      <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
        {siteConfig.tagline}
      </span>
      <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Every wedding detail, beautifully in one place
      </h1>
      <p className="max-w-xl text-balance text-lg text-muted-foreground">
        Discover trusted vendors, track your budget and plan your big day
        without the chaos — all with {siteConfig.name}.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={siteConfig.routes.services}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Browse Services
        </Link>
        <Link
          href={siteConfig.routes.signUp}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
