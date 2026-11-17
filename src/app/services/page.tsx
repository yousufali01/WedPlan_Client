import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Browse Services",
};

export default function BrowseServicesPage() {
  return (
    <PagePlaceholder
      title="Browse Services"
      description="Explore trusted wedding vendors — venues, photographers, caterers, decorators and more. The full listing experience is coming soon."
      cta={{ href: siteConfig.routes.signUp, label: "Sign Up to Get Started" }}
    />
  );
}
