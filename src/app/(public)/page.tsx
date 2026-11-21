"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Heart,
  Camera,
  MapPin,
  Flower2,
  Utensils,
  Sparkles,
  Gem,
  Star,
  ShieldCheck,
  CalendarCheck,
  Search,
  ChevronRight,
  Check,
  BookOpen,
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
  photos?: string[];
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

type ServiceCategory = {
  title: string;
  service: Service;
  count: number;
};

function getCategoryIcon(category: string) {
  const value = category.toLowerCase();

  if (value.includes("photo") || value.includes("video")) return Camera;
  if (value.includes("venue") || value.includes("location")) return MapPin;
  if (value.includes("decor") || value.includes("flor")) return Flower2;
  if (value.includes("cater") || value.includes("food")) return Utensils;
  if (value.includes("makeup") || value.includes("beauty")) return Sparkles;
  if (value.includes("fashion") || value.includes("jewel")) return Gem;

  return Heart;
}

const testimonials = [
  {
    quote:
      "WedPlan made planning our wedding feel effortless. We found our venue, photographer and decorator in one beautiful place.",
    name: "Sophia & Liam",
    role: "A celebration to remember",
  },
  {
    quote:
      "Finding trusted wedding professionals was easier than we ever imagined. Everything felt organized, thoughtful and beautiful.",
    name: "Amara & Daniel",
    role: "Our beautiful beginning",
  },
  {
    quote:
      "The service listings and booking process saved us so much time. We could focus on enjoying every moment of our wedding journey.",
    name: "Clara & Ethan",
    role: "Happily ever after",
  },
];

const weddingPlanningTips = [
  {
    number: "01",
    title: "Establish Your Vision & Budget Early",
    description:
      "Define your guest count range and core priorities before committing to contracts. Allocating funds across venues, photo, and decor keeps decisions clear and stress-free.",
  },
  {
    number: "02",
    title: "Secure High-Demand Vendors 6-9 Months Ahead",
    description:
      "Premium wedding venues, cinematographers, and bridal artists often book up a year in advance. Reserve early to guarantee your preferred dates and dates of celebration.",
  },
  {
    number: "03",
    title: "Curate a Cohesive Palette & Timeline",
    description:
      "Share moodboards and synchronized schedules between your floral designer, caterer, and photographer for a seamless, photogenic, and memorable wedding day.",
  },
];

function getServiceName(service: Service) {
  return (
    service.title || service.name || service.serviceName || "Wedding Service"
  );
}

function getServiceImage(service: Service) {
  return service.imageUrl || service.image || service.photos?.[0] || "";
}

function getVendorName(service: Service) {
  return (
    service.vendor?.businessName ||
    service.vendor?.name ||
    service.vendorName ||
    "Vendor"
  );
}

function getVendorTitle(service: Service) {
  return service.vendorTitle || "Service Provider";
}

function getVendorAvatar(service: Service) {
  return service.vendorAvatar || service.vendor?.image || "";
}

function getServicePrice(service: Service) {
  const price = service.startingPrice ?? service.price;

  if (price === undefined || price === null || price === "") {
    return "Contact for pricing";
  }

  if (
    typeof price === "string" &&
    (price.includes("৳") || price.includes("$"))
  ) {
    return price;
  }

  const amount = Number(price);

  return Number.isNaN(amount)
    ? String(price)
    : `From ৳${amount.toLocaleString("en-BD")}`;
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [visibleServicesCount, setVisibleServicesCount] = useState(6);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(6);

  const handleServiceClick = (e: React.MouseEvent, serviceId: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.info("Please sign in to view wedding service details.");

      router.push(
        `${siteConfig.routes.signIn}?callbackURL=${encodeURIComponent(`/services/${serviceId}`)}`,
      );
    }
  };

  useEffect(() => {
    const loadServices = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000";

        const apiUrl = `${baseUrl.replace(/\/+$/, "")}/api/v1/services`;
        const response = await fetch(apiUrl, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch wedding services");
        }

        const result = await response.json();

        const serviceList = Array.isArray(result)
          ? result
          : [
              result.services,
              result.data?.services,
              result.data?.results,
              result.data,
              result.result?.services,
              result.result,
              result.results,
            ].find(Array.isArray) || [];

        setServices(serviceList);
      } catch (error) {
        console.error("Homepage services error:", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  // Build unique categories from the services returned by the backend.
  const categories: ServiceCategory[] = services.reduce(
    (result: ServiceCategory[], service) => {
      const categoryName = service.category?.trim();

      if (!categoryName) return result;

      const existingCategory = result.find(
        (category) =>
          category.title.toLowerCase() === categoryName.toLowerCase(),
      );

      if (existingCategory) {
        existingCategory.count += 1;
      } else {
        result.push({ title: categoryName, service, count: 1 });
      }

      return result;
    },
    [],
  );

  return (
    <main className="overflow-hidden bg-[#FAF8F2] text-[#183D2D]">
      {/* ================= PREMIUM HERO ================= */}

      <section
        id="home"
        className="relative isolate flex min-h-[700px] items-center overflow-hidden bg-[#102F23] sm:min-h-[760px] lg:min-h-[820px] xl:min-h-[850px]"
      >
        {/* Background Video */}
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/Banner.jpg"
            className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-center"
          >
            <source src="/videos/wedding-hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Luxury Image Overlay */}
        <div className="absolute inset-0 -z-10 bg-[#102F23]/65" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102F23]/95 via-[#102F23]/80 to-[#102F23]/25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#102F23]/90 via-transparent to-[#102F23]/30" />

        {/* Decorative Gold Circles */}
        <div className="pointer-events-none absolute -right-44 top-1/2 hidden h-[700px] w-[700px] -translate-y-1/2 rounded-full border border-[#D5B66D]/10 lg:block" />
        <div className="pointer-events-none absolute -right-28 top-1/2 hidden h-[540px] w-[540px] -translate-y-1/2 rounded-full border border-[#D5B66D]/15 lg:block" />
        <div className="pointer-events-none absolute -right-12 top-1/2 hidden h-[380px] w-[380px] -translate-y-1/2 rounded-full border border-[#D5B66D]/20 lg:block" />

        {/* Main Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pb-28 sm:pt-36 lg:px-12">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="hero-reveal flex items-center gap-4">
              <span className="h-px w-12 bg-[#D5B66D]" />

              <span className="text-[10px] font-semibold uppercase tracking-[4px] text-[#E5C77E] sm:text-xs sm:tracking-[5px]">
                {siteConfig.tagline}
              </span>

              <span className="h-px w-12 bg-[#D5B66D]/50" />
            </div>

            {/* Heading */}
            <h1 className="hero-reveal hero-delay-1 mt-9 max-w-4xl font-serif text-[46px] font-medium leading-[1.08] tracking-[-1.5px] text-white sm:text-6xl md:text-7xl lg:text-[90px]">
              Every Love Story
              <br />
              Deserves a{" "}
              <span className="italic text-[#D5B66D]">Beautiful</span>
              <br />
              Beginning.
            </h1>

            {/* Description */}
            <p className="hero-reveal hero-delay-2 mt-8 max-w-[530px] text-sm leading-8 text-white/75 sm:text-base sm:leading-9">
              From finding the perfect venue to the smallest finishing touches,
              bring your wedding vision to life with trusted professionals and
              thoughtfully curated services.
            </p>

            {/* CTA Buttons */}
            <div className="hero-reveal hero-delay-3 mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={siteConfig.routes.services}
                className="group inline-flex items-center gap-4 rounded-full bg-[#D5B66D] px-7 py-4 text-xs font-semibold tracking-wide text-[#183D2D] shadow-[0_8px_30px_rgba(213,182,109,0.15)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#E8CD91] hover:shadow-[0_12px_35px_rgba(213,182,109,0.25)] sm:px-9 sm:py-[18px] sm:text-sm"
              >
                Explore Wedding Services
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href={siteConfig.routes.services}
                className="group inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/[0.04] px-7 py-4 text-xs font-medium tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D5B66D] hover:bg-[#D5B66D]/10 hover:text-[#E5C77E] sm:px-9 sm:py-[18px] sm:text-sm"
              >
                Start Your Journey
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="hero-reveal hero-delay-4 mt-16 flex flex-wrap items-center gap-x-9 gap-y-5 border-t border-white/15 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5B66D]/30 bg-[#D5B66D]/10">
                  <ShieldCheck size={17} className="text-[#D5B66D]" />
                </div>

                <span className="text-xs font-medium tracking-wide text-white/75">
                  Trusted Professionals
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5B66D]/30 bg-[#D5B66D]/10">
                  <Heart size={17} className="text-[#D5B66D]" />
                </div>

                <span className="text-xs font-medium tracking-wide text-white/75">
                  Thoughtful Planning
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5B66D]/30 bg-[#D5B66D]/10">
                  <Sparkles size={17} className="text-[#D5B66D]" />
                </div>

                <span className="text-xs font-medium tracking-wide text-white/75">
                  Unforgettable Moments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gold Accent */}
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#D5B66D]/60 to-transparent" />

        {/* Scroll Indicator */}
        <div className="absolute bottom-9 right-12 hidden flex-col items-center gap-3 lg:flex">
          <span className="text-[9px] font-medium uppercase tracking-[4px] text-white/50">
            Scroll to Discover
          </span>

          <span className="h-12 w-px bg-gradient-to-b from-[#D5B66D] to-transparent" />
        </div>
      </section>

      {/* ================= INTRO STRIP ================= */}

      <section className="border-b border-[#E8E1D3] bg-[#F4F0E6] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-serif text-xl text-[#183D2D] sm:text-2xl">
              A little help for your biggest day.
            </p>

            <p className="mt-1 text-xs leading-6 text-[#747B73] sm:text-sm">
              Everything you need to plan a celebration filled with love.
            </p>
          </div>

          <Link
            href={siteConfig.routes.services}
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#183D2D]"
          >
            Discover WedPlan
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
      {/* ================= FEATURED SERVICES ================= */}

      <section id="services" className="px-5 py-20 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Section heading */}

          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#B4934C]" />

                <p className="text-[10px] font-medium uppercase tracking-[3px] text-[#B4934C]">
                  Curated & Approved
                </p>
              </div>

              <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                Featured Wedding Services
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#747B73]">
                Explore approved, top-rated wedding professionals who bring your
                celebration to life with care, authenticity and extraordinary
                artistry.
              </p>
            </div>

            <Link
              href={siteConfig.routes.services}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#D8CBAA] px-6 py-3 text-xs font-semibold text-[#183D2D] transition hover:border-[#183D2D] hover:bg-[#183D2D] hover:text-white"
            >
              View All Services
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Loading skeleton */}

          {loadingServices && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[410px] animate-pulse rounded-2xl bg-[#EAE4D8]"
                />
              ))}
            </div>
          )}

          {/* Service cards */}

          {!loadingServices && services.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, visibleServicesCount).map((service, index) => {
                const serviceId = service._id || service.id || String(index);

                return (
                  <Link
                    key={serviceId}
                    href={`${siteConfig.routes.services}/${serviceId}`}
                    onClick={(e) => handleServiceClick(e, serviceId)}
                    className="service-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E8E1D3] bg-white transition duration-500 hover:-translate-y-1.5 hover:border-[#D5B66D]/60 hover:shadow-[0_20px_50px_rgba(24,61,45,0.10)]"
                  >
                    {/* Image */}

                    <div className="relative h-[260px] overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: getServiceImage(service)
                            ? `url('${getServiceImage(service)}')`
                            : "none",
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#102F23]/60 via-transparent to-[#102F23]/5" />

                      {/* Category */}

                      <span className="absolute left-4 top-4 rounded-full border border-[#D5B66D]/30 bg-[#183D2D]/90 px-4 py-2 text-[9px] font-medium uppercase tracking-[1.5px] text-[#D5B66D] backdrop-blur-md">
                        {service.category || "Service"}
                      </span>

                      {/* Heart */}

                      <span className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#183D2D] transition group-hover:bg-[#D5B66D]">
                        <Heart size={15} />
                      </span>

                      {/* Image bottom label */}

                      {(service.city || service.location) && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80">
                          <MapPin size={12} />
                          <span className="text-[10px]">
                            {service.city || service.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}

                    <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                      <div>
                        <h3 className="font-serif text-xl leading-snug text-[#183D2D] transition group-hover:text-[#B4934C]">
                          {getServiceName(service)}
                        </h3>

                        <p className="mt-2 line-clamp-2 min-h-[48px] text-xs leading-6 text-[#747B73]">
                          {service.description || "No description provided."}
                        </p>
                      </div>

                      <div>
                        {/* Vendor Information */}

                        <div className="mt-4 flex items-center gap-2.5 border-t border-[#f0eae1] pt-3.5">
                          {getVendorAvatar(service) ? (
                            <img
                              src={getVendorAvatar(service)}
                              alt={getVendorName(service)}
                              className="size-8 shrink-0 rounded-full border border-[#D5B66D]/30 bg-muted object-cover"
                            />
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#D5B66D]/30 bg-[#F1EBDD] text-xs font-semibold text-[#183D2D]">
                              {getVendorName(service).charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-[#183D2D] leading-tight">
                              {getVendorName(service)}
                            </p>

                            <p className="text-[11px] text-[#888] leading-tight mt-0.5">
                              {getVendorTitle(service)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E8E1D3] pt-4">
                          <span className="text-[10px] uppercase tracking-wider text-[#8C9289]">
                            Starting from
                          </span>

                          <span className="font-medium text-sm text-[#183D2D]">
                            {getServicePrice(service)}
                          </span>
                        </div>

                        {/* View Details CTA */}

                        <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#183D2D] px-5 py-3 text-xs font-semibold text-white transition duration-300 group-hover:bg-[#D5B66D] group-hover:text-[#183D2D]">
                          View Details
                          <ArrowRight
                            size={14}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* View More Services */}

          {!loadingServices && services.length > visibleServicesCount && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleServicesCount((current) => current + 6)
                }
                className="group inline-flex items-center gap-3 rounded-full border border-[#D8CBAA] px-8 py-3.5 text-xs font-semibold text-[#183D2D] transition hover:border-[#183D2D] hover:bg-[#183D2D] hover:text-white"
              >
                View All Services
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          )}

          {/* Empty state */}

          {!loadingServices && services.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#C9B987] bg-[#F1EBDD] px-6 py-16 text-center">
              <Heart className="mx-auto mb-4 text-[#B4934C]" size={30} />

              <h3 className="font-serif text-2xl">
                Something beautiful is coming
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#747B73]">
                Our wedding professionals are preparing their services. Explore
                all available categories and find inspiration for your special
                day.
              </p>

              <Link
                href={siteConfig.routes.services}
                className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#183D2D]"
              >
                Explore Services
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section
        id="categories"
        className="relative overflow-hidden bg-[#183D2D] px-5 py-20 text-white sm:px-8 md:py-24 lg:px-12"
      >
        {/* Subtle background detail */}

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#D5B66D]/10" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#D5B66D]/10" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#D5B66D]" />

              <p className="text-[10px] uppercase tracking-[3px] text-[#D5B66D]">
                Browse by Category
              </p>

              <span className="h-px w-8 bg-[#D5B66D]" />
            </div>

            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              Wedding Service Categories
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60">
              Explore trusted professionals and artisans across every category
              of your dream celebration.
            </p>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[330px] animate-pulse rounded-2xl bg-white/10"
                />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {categories
                  .slice(0, visibleCategoriesCount)
                  .map((category, index) => {
                    const Icon = getCategoryIcon(category.title);

                    return (
                      <Link
                        key={category.title}
                        href={`${siteConfig.routes.services}?category=${encodeURIComponent(category.title)}`}
                        className="category-card group relative h-[330px] overflow-hidden rounded-2xl border border-white/10"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                          style={{
                            backgroundImage: getServiceImage(category.service)
                              ? `url('${getServiceImage(category.service)}')`
                              : "none",
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D281D]/95 via-[#0D281D]/25 to-[#0D281D]/5 transition group-hover:from-[#0D281D]/90" />

                        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-7">
                          <div className="mb-5 flex size-12 items-center justify-center rounded-full border border-[#D5B66D]/50 bg-[#183D2D]/60 text-[#D5B66D] backdrop-blur-md transition duration-300 group-hover:bg-[#D5B66D] group-hover:text-[#183D2D]">
                            <Icon size={19} />
                          </div>

                          <h3 className="font-serif text-2xl text-white">
                            {category.title}
                          </h3>

                          <p className="mt-2 text-xs text-white/65">
                            Explore {category.count} available{" "}
                            {category.count === 1 ? "service" : "services"} in
                            this category.
                          </p>

                          <div className="mt-5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[1.5px] text-[#D5B66D]">
                            Discover More
                            <ArrowRight
                              size={13}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>

              {/* View More Categories */}

              {categories.length > visibleCategoriesCount && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCategoriesCount((current) => current + 6)
                    }
                    className="group inline-flex items-center gap-3 rounded-full border border-[#D5B66D]/50 px-8 py-3.5 text-xs font-semibold text-[#D5B66D] transition hover:bg-[#D5B66D] hover:text-[#183D2D]"
                  >
                    View All Categories
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-14 text-center">
              <Heart className="mx-auto mb-4 text-[#D5B66D]" size={30} />

              <h3 className="font-serif text-2xl text-white">
                No categories available yet
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/60">
                Wedding service categories will appear here as soon as services
                are added.
              </p>
            </div>
          )}
        </div>
      </section>
      {/* ================= WHY WEDPLAN ================= */}

      <section id="about" className="px-5 py-20 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Image */}

          <div className="relative">
            <div
              className="relative h-[400px] overflow-hidden rounded-2xl bg-cover bg-center sm:h-[520px]"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=90')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#183D2D]/30 to-transparent" />
            </div>

            {/* Floating badge */}

            <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-[#D5B66D]/30 bg-[#D5B66D] p-6 text-[#183D2D] shadow-xl sm:block">
              <Heart size={22} className="mb-3" />
              <p className="font-serif text-2xl">Made with Love</p>
              <p className="mt-1 text-xs">Planned with care</p>
            </div>

            {/* Decorative frame */}

            <div className="pointer-events-none absolute -left-4 -top-4 -z-10 h-full w-full rounded-2xl border border-[#D5B66D]/50" />
          </div>

          {/* Content */}

          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B4934C]" />

              <p className="text-[10px] uppercase tracking-[3px] text-[#B4934C]">
                Platform Benefits
              </p>
            </div>

            <h2 className="font-serif text-4xl font-medium leading-tight sm:text-5xl">
              Why Choose WedPlan?
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#737B72]">
              We believe planning your wedding should feel as beautiful and
              seamless as the day itself. WedPlan brings couples and verified
              wedding professionals together with transparent pricing,
              guaranteed dates, and thoughtful coordination.
            </p>

            <div className="mt-9 space-y-7">
              {[
                {
                  icon: ShieldCheck,
                  title: "100% Verified Professionals",
                  description:
                    "Explore wedding vendors carefully vetted, approved, and reviewed by our curation team.",
                },
                {
                  icon: Search,
                  title: "Effortless Discovery & Quotes",
                  description:
                    "Compare transparent packages and check real-time availability across top venues, photo, decor, and fashion.",
                },
                {
                  icon: CalendarCheck,
                  title: "Simplified Planning & Requests",
                  description:
                    "Send direct booking requests, monitor vendor responses, and keep every contract and date organized in one place.",
                },
                {
                  icon: Gem,
                  title: "Unmatched Peace of Mind",
                  description:
                    "A stress-free wedding planning experience backed by dedicated customer support for your celebration.",
                },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#D5B66D]/30 bg-[#F0EBDF] text-[#183D2D]">
                      <Icon size={19} />
                    </div>

                    <div>
                      <h3 className="font-serif text-lg text-[#183D2D]">
                        {feature.title}
                      </h3>

                      <p className="mt-1.5 text-xs leading-6 text-[#737B72]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href={siteConfig.routes.services}
              className="group mt-9 inline-flex items-center gap-3 border-b border-[#D5B66D] pb-2 text-xs font-semibold text-[#183D2D]"
            >
              Discover the WedPlan Experience
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section
        id="how-it-works"
        className="border-y border-[#E8E1D3] bg-[#F1EBDD] px-5 py-20 sm:px-8 md:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#B4934C]" />

              <p className="text-[10px] uppercase tracking-[3px] text-[#B4934C]">
                Simple 3-Step Process
              </p>

              <span className="h-px w-8 bg-[#B4934C]" />
            </div>

            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              How WedPlan Works
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#737B72]">
              Three thoughtful steps to turn your wedding dreams into a
              celebration you will cherish forever.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: Search,
                title: "Discover",
                description:
                  "Explore beautiful wedding services, discover trusted vendors and find inspiration for your celebration.",
              },
              {
                number: "02",
                icon: CalendarCheck,
                title: "Plan & Book",
                description:
                  "Choose your preferred professionals and send booking requests for your special day.",
              },
              {
                number: "03",
                icon: Heart,
                title: "Celebrate",
                description:
                  "Keep your plans organized and enjoy the journey towards your unforgettable wedding.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="group relative border-t border-[#D5B66D]/50 pt-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl text-[#D5B66D]">
                    {step.number}
                  </span>

                  <div className="flex size-12 items-center justify-center rounded-full border border-[#D5B66D]/40 text-[#183D2D] transition duration-300 group-hover:bg-[#183D2D] group-hover:text-[#D5B66D]">
                    <step.icon size={20} />
                  </div>
                </div>

                <h3 className="mt-6 font-serif text-2xl text-[#183D2D]">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-7 text-[#737B72]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= VENDOR CTA ================= */}

      <section className="relative overflow-hidden bg-[#183D2D] px-5 py-20 sm:px-8 md:py-24 lg:px-12">
        {/* Decorative circles */}

        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-[#D5B66D]/10" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-[#D5B66D]/10" />
        <div className="pointer-events-none absolute -left-32 -bottom-40 h-[400px] w-[400px] rounded-full border border-white/5" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 text-center md:flex-row md:text-left">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
              <span className="h-px w-8 bg-[#D5B66D]" />

              <p className="text-[10px] uppercase tracking-[3px] text-[#D5B66D]">
                For Wedding Professionals
              </p>
            </div>

            <h2 className="font-serif text-4xl font-medium leading-tight text-white sm:text-5xl">
              Let Your Talent
              <br />
              <span className="italic text-[#D5B66D]">Find Its People.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
              Showcase your work, connect with couples and grow your wedding
              business through a platform made for beautiful celebrations.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3 md:justify-start">
              {[
                "Showcase your services",
                "Reach new couples",
                "Grow your business",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-white/70"
                >
                  <Check size={14} className="text-[#D5B66D]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Link
            href={siteConfig.routes.signUp}
            className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-[#D5B66D] px-8 py-4 text-xs font-semibold text-[#183D2D] transition duration-300 hover:bg-[#E8CD91]"
          >
            Become a Wedding Vendor
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
      {/* ================= TESTIMONIALS ================= */}

      <section
        id="testimonials"
        className="px-5 py-20 sm:px-8 md:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#B4934C]" />

              <p className="text-[10px] uppercase tracking-[3px] text-[#B4934C]">
                Couples Love WedPlan
              </p>

              <span className="h-px w-8 bg-[#B4934C]" />
            </div>

            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              Customer Testimonials
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#737B72]">
              The most beautiful stories are the ones made with love, care and
              trusted professionals by your side.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="group rounded-2xl border border-[#E8E1D3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D5B66D]/50 hover:shadow-[0_15px_40px_rgba(24,61,45,0.07)] sm:p-8"
              >
                <div className="mb-5 flex gap-1 text-[#C4A45D]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={13} fill="currentColor" />
                  ))}
                </div>

                <p className="font-serif text-lg italic leading-8 text-[#314D3C]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="mt-7 border-t border-[#E8E1D3] pt-5">
                  <h3 className="text-sm font-semibold text-[#183D2D]">
                    {testimonial.name}
                  </h3>

                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[#8B9187]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WEDDING PLANNING TIPS ================= */}

      <section className="border-t border-[#E8E1D3] bg-[#F7F4EC] px-5 py-20 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#B4934C]" />

              <p className="text-[10px] uppercase tracking-[3px] text-[#B4934C]">
                Expert Guidance
              </p>

              <span className="h-px w-8 bg-[#B4934C]" />
            </div>

            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              Wedding Planning Tips
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#737B72]">
              Thoughtful advice and insider secrets from wedding curators to
              help you prepare every detail with grace.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {weddingPlanningTips.map((tip) => (
              <div
                key={tip.number}
                className="group rounded-2xl border border-[#E8E1D3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D5B66D]/60 hover:shadow-md sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl font-medium text-[#B4934C]">
                    {tip.number}
                  </span>

                  <div className="flex size-10 items-center justify-center rounded-full bg-[#FAF8F2] text-[#183D2D] border border-[#D5B66D]/30 group-hover:bg-[#183D2D] group-hover:text-white transition">
                    <BookOpen size={16} />
                  </div>
                </div>

                <h3 className="mt-5 font-serif text-xl font-medium text-[#183D2D]">
                  {tip.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-[#737B72]">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}

      <section className="px-5 py-20 pb-20 sm:px-8 md:pb-24 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#EAE4D8] px-6 py-16 text-center sm:px-12 sm:py-20">
          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#B4934C]/15" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full border border-[#B4934C]/15" />

          <div className="relative">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-[#D5B66D]/50 bg-[#FAF8F2] text-[#B4934C]">
              <Heart size={22} />
            </div>

            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#B4934C]" />

              <p className="text-[10px] uppercase tracking-[3px] text-[#B4934C]">
                Your story deserves it
              </p>

              <span className="h-px w-8 bg-[#B4934C]" />
            </div>

            <h2 className="font-serif text-4xl font-medium leading-tight text-[#183D2D] sm:text-5xl md:text-6xl">
              Begin Your Forever
              <br />
              <span className="italic text-[#B4934C]">Beautifully.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#737B72]">
              Let the planning begin. Discover your dream wedding services and
              make every detail of your special day unforgettable.
            </p>

            <Link
              href={siteConfig.routes.services}
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#183D2D] px-8 py-4 text-xs font-semibold text-white transition duration-300 hover:bg-[#285640]"
            >
              Start Planning Today
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
