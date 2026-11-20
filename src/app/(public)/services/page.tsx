"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { siteConfig } from "@/config/site";

type Service = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  serviceName?: string;
  category?: string;
  description?: string;
  price?: number | string;
  startingPrice?: number | string;
  location?: string;
  city?: string;
  image?: string;
  imageUrl?: string;
  images?: string[];
  photos?: string[];
  availability?: boolean;
  featured?: boolean;
  vendorName?: string;
  vendorTitle?: string;
  vendorAvatar?: string;
  vendor?: {
    id?: string;
    name?: string;
    businessName?: string;
    image?: string | null;
  };
};

const CATEGORIES = [
  "All Categories",
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
  "Other",
];

function getServiceName(service: Service): string {
  return (
    service.title || service.name || service.serviceName || "Wedding Service"
  );
}

function getServiceImage(service: Service): string {
  return (
    service.imageUrl ||
    service.image ||
    service.images?.[0] ||
    service.photos?.[0] ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85"
  );
}

function formatPriceDisplay(service: Service): string {
  const p = service.price ?? service.startingPrice;

  if (p === undefined || p === null || p === "") {
    return "Contact";
  }

  if (typeof p === "string" && (p.includes("$") || p.includes("৳"))) {
    return p;
  }

  const num = Number(p);

  return Number.isNaN(num) ? String(p) : `৳${num.toLocaleString("en-BD")}`;
}

function parsePriceNumber(service: Service): number {
  const p = service.price ?? service.startingPrice;

  if (typeof p === "number") return p;

  if (typeof p === "string") {
    const clean = Number(p.replace(/[^0-9.]/g, ""));
    return Number.isNaN(clean) ? 0 : clean;
  }

  return 0;
}

function BrowseServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  // MongoDB dynamic services
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const urlCategory = searchParams.get("category");

  // Live filter states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState(
    urlCategory || "All Categories",
  );
  const [locationFilter, setLocationFilter] = React.useState("");
  const [sortOption, setSortOption] = React.useState<
    "featured" | "price-low" | "price-high"
  >("featured");

  // Fetch services from MongoDB
  const fetchServices = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000";

      const apiUrl = `${baseUrl.replace(/\/+$/, "")}/api/v1/services`;

      const response = await fetch(apiUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wedding services.");
      }

      const result = await response.json();

      const list = Array.isArray(result)
        ? result
        : result.services || result.data || result.result || [];

      setServices(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Services fetching error:", error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void fetchServices();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchServices]);

  // Authentication check
  const handleViewDetails = React.useCallback(
    (e: React.MouseEvent, serviceId: string) => {
      if (!isAuthenticated) {
        e.preventDefault();

        toast.info("Please sign in to view wedding service details.");

        router.push(
          `${siteConfig.routes.signIn}?callbackURL=${encodeURIComponent(
            `/services/${serviceId}`,
          )}`,
        );
      }
    },
    [isAuthenticated, router],
  );

  // Live search, category, location and sorting
  const filteredServices = React.useMemo(() => {
    const searchQ = searchTerm.trim().toLowerCase();
    const locQ = locationFilter.trim().toLowerCase();
    const aCat = selectedCategory.toLowerCase();

    return services
      .filter((service) => {
        const sCat = (service.category || "").toLowerCase();

        const matchesCategory =
          selectedCategory === "All Categories" ||
          sCat === aCat ||
          sCat.includes(aCat) ||
          aCat.includes(sCat) ||
          (aCat.includes("cater") && sCat.includes("cater")) ||
          (aCat.includes("photo") && sCat.includes("photo")) ||
          (aCat.includes("decor") && sCat.includes("decor")) ||
          (aCat.includes("venue") && sCat.includes("venue")) ||
          (aCat.includes("fashion") && sCat.includes("fashion")) ||
          (aCat.includes("makeup") &&
            (sCat.includes("makeup") || sCat.includes("bridal")));

        const name = getServiceName(service).toLowerCase();
        const desc = (service.description || "").toLowerCase();
        const category = (service.category || "").toLowerCase();

        const matchesSearch =
          !searchQ ||
          name.includes(searchQ) ||
          desc.includes(searchQ) ||
          category.includes(searchQ);

        const loc = (service.location || service.city || "").toLowerCase();

        const matchesLocation = !locQ || loc.includes(locQ);

        return matchesCategory && matchesSearch && matchesLocation;
      })
      .sort((a, b) => {
        if (sortOption === "price-low") {
          return parsePriceNumber(a) - parsePriceNumber(b);
        }

        if (sortOption === "price-high") {
          return parsePriceNumber(b) - parsePriceNumber(a);
        }

        return 0;
      });
  }, [services, searchTerm, selectedCategory, locationFilter, sortOption]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setLocationFilter("");
    setSortOption("featured");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-[#222]">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5 text-gold" />
            Curated Wedding Marketplace
          </span>

          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#183D2D] sm:text-5xl">
            Browse Wedding Services
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#555E53] sm:text-base">
            Search verified photographers, dream venues, florists, caterers, and
            stylists. Sign in to view full galleries and send booking requests.
          </p>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="mt-8 rounded-2xl border border-[#ede7de] bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.1fr_1.2fr_1.1fr]">
            {/* SEARCH INPUT */}
            <div className="relative flex min-w-0 items-center rounded-xl border border-[#e6dfd5] bg-white px-3 py-3 transition focus-within:border-primary">
              <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />

              <input
                type="search"
                placeholder="Search service name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs text-[#183D2D] outline-none placeholder:text-[#888] sm:text-sm"
              />
            </div>

            {/* CATEGORY FILTER */}
            <div className="relative flex min-w-0 items-center rounded-xl border border-[#e6dfd5] bg-white px-3 py-3 transition focus-within:border-primary">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-6 text-xs text-[#183D2D] outline-none sm:text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 size-4 text-[#888]" />
            </div>

            {/* LOCATION FILTER */}
            <div className="relative flex min-w-0 items-center rounded-xl border border-[#e6dfd5] bg-white px-3 py-3 transition focus-within:border-primary">
              <MapPin className="mr-2 size-4 shrink-0 text-muted-foreground" />

              <input
                type="text"
                placeholder="Filter by city / location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs text-[#183D2D] outline-none placeholder:text-[#888] sm:text-sm"
              />
            </div>

            {/* SORT FILTER */}
            <div className="relative flex min-w-0 items-center rounded-xl border border-[#e6dfd5] bg-white px-3 py-3 transition focus-within:border-primary">
              <SlidersHorizontal className="mr-2 size-4 shrink-0 text-muted-foreground" />

              <select
                value={sortOption}
                onChange={(e) =>
                  setSortOption(
                    e.target.value as "featured" | "price-low" | "price-high",
                  )
                }
                className="w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-6 text-xs text-[#183D2D] outline-none sm:text-sm"
              >
                <option value="featured">Featured & Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 size-4 text-[#888]" />
            </div>
          </div>

          {/* RESET FILTER */}
          {(searchTerm ||
            locationFilter ||
            selectedCategory !== "All Categories" ||
            sortOption !== "featured") && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#183D2D] transition hover:bg-[#f5f2ec]"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* RESULTS COUNT */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-[#777]">
            Showing {filteredServices.length} of {services.length} approved
            wedding services
          </p>
        </div>

        {/* SERVICES GRID */}
        {isLoading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />

            <p className="text-sm text-muted-foreground">
              Loading wedding services...
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#ede7de] bg-white p-8 text-center">
            <Search className="mb-3 size-8 text-[#aaa]" />

            <p className="font-heading text-lg font-bold text-[#183D2D]">
              No wedding services found
            </p>

            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Try adjusting your search criteria or resetting filters.
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-xl bg-[#183D2D] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#122e22]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service, index) => {
              const serviceId = service._id || service.id || `service-${index}`;

              const title = getServiceName(service);
              const priceTag = formatPriceDisplay(service);
              const image = getServiceImage(service);

              const vendor =
                service.vendorName ||
                service.vendor?.businessName ||
                service.vendor?.name ||
                "WedPlan Partner";

              const vendorTitle =
                service.vendorTitle || "Verified Wedding Vendor";

              const avatar =
                service.vendorAvatar || service.vendor?.image || "";

              return (
                <div
                  key={serviceId}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ede7de] bg-white shadow-sm transition duration-300 hover:shadow-md"
                >
                  {/* SERVICE IMAGE */}
                  <div className="relative h-[230px] w-full overflow-hidden bg-muted">
                    <div
                      className="size-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${image}')`,
                      }}
                    />

                    {/* BADGES */}
                    <div className="absolute left-3 right-3 top-3 flex flex-wrap items-center gap-2">
                      <span className="max-w-full truncate rounded-full border border-[#ede7de] bg-white/95 px-3 py-1 text-xs font-semibold text-[#183D2D] shadow-sm backdrop-blur-sm">
                        {service.category || "Wedding Service"}
                      </span>

                      {service.featured ? (
                        <span className="flex items-center gap-1 rounded-full border border-[#f5df9a] bg-[#fdf6e2]/95 px-3 py-1 text-xs font-semibold text-[#966b12] shadow-sm backdrop-blur-sm">
                          <Sparkles className="size-3 text-gold" />
                          Featured Partner
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#e6dfd5] bg-white/95 px-3 py-1 text-xs font-semibold text-[#555E53] shadow-sm backdrop-blur-sm">
                          Verified Partner
                        </span>
                      )}
                    </div>

                    {/* PRICE */}
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/75 px-3.5 py-1 text-xs font-bold text-white shadow backdrop-blur-sm">
                      {priceTag}
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* TITLE */}
                    <h2 className="line-clamp-1 font-heading text-lg font-bold text-[#183D2D] transition group-hover:text-primary">
                      {title}
                    </h2>

                    {/* LOCATION */}
                    <div className="mt-1 flex items-center gap-1 text-xs text-[#78716c]">
                      <MapPin className="size-3.5 shrink-0 text-primary/70" />

                      <span className="truncate">
                        {service.location ||
                          service.city ||
                          "Location on request"}
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="mt-3 line-clamp-2 min-h-[36px] text-xs leading-relaxed text-[#555E53]">
                      {service.description ||
                        "Wedding service from a verified WedPlan partner."}
                    </p>

                    {/* VENDOR INFORMATION */}
                    <div className="mt-4 flex items-center gap-2.5 border-t border-[#f0eae1] pt-3.5">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={vendor}
                          className="size-8 shrink-0 rounded-full bg-muted object-cover"
                        />
                      ) : (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {vendor.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold leading-tight text-[#183D2D]">
                          {vendor}
                        </p>

                        <p className="mt-0.5 text-[11px] leading-tight text-[#888]">
                          {vendorTitle}
                        </p>
                      </div>
                    </div>

                    {/* VIEW DETAILS */}
                    <Link
                      href={`${siteConfig.routes.services}/${serviceId}`}
                      onClick={(e) => handleViewDetails(e, serviceId)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#183D2D] py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#122e22]"
                    >
                      View Details
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowseServicesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <BrowseServicesContent />
    </React.Suspense>
  );
}
