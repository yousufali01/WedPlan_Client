"use client";

import Link from "next/link";
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
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { CopyrightYear } from "@/components/layout/copyright-year";

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
};

const categories = [
  {
    title: "Photography",
    description: "Keep every precious moment forever",
    icon: Camera,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Wedding Venues",
    description: "Discover extraordinary places to celebrate",
    icon: MapPin,
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Decoration & Florist",
    description: "Beautiful details for your dream day",
    icon: Flower2,
    image:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Catering",
    description: "Exceptional taste for your celebration",
    icon: Utensils,
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Makeup & Styling",
    description: "Look and feel your most beautiful",
    icon: Sparkles,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Wedding Fashion",
    description: "Find your perfect wedding look",
    icon: Gem,
    image:
      "https://images.unsplash.com/photo-1594552072238-9c4c9a2c3a7b?auto=format&fit=crop&w=900&q=85",
  },
];

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

function getServiceName(service: Service) {
  return service.title || service.name || service.serviceName || "Wedding Service";
}

function getServiceImage(service: Service) {
  return (
    service.imageUrl ||
    service.image ||
    service.photos?.[0] ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85"
  );
}

function getServicePrice(service: Service) {
  const price = service.startingPrice ?? service.price;

  if (price === undefined || price === null || price === "") {
    return "Contact for pricing";
  }

  if (typeof price === "string" && price.includes("৳")) {
    return price;
  }

  const amount = Number(price);

  return Number.isNaN(amount)
    ? String(price)
    : `From ৳${amount.toLocaleString("en-BD")}`;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_SERVICES_API_URL ||
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/services`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch wedding services");
        }

        const result = await response.json();

        const serviceList = Array.isArray(result)
          ? result
          : result.services ||
            result.data ||
            result.result ||
            result.results ||
            [];

        setServices(Array.isArray(serviceList) ? serviceList.slice(0, 6) : []);
      } catch (error) {
        console.error("Homepage services error:", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  return (
    <main className="overflow-hidden bg-[#FAF8F2] text-[#183D2D]">
      {/* ================= HERO ================= */}
      <section
        id="home"
        className="relative flex min-h-[680px] items-center overflow-hidden sm:min-h-[760px] lg:min-h-[820px]"
      >
        {/* Background */}
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90')",
          }}
        />

        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-[#102F23]/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102F23]/95 via-[#183D2D]/80 to-[#183D2D]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102F23]/50 via-transparent to-[#102F23]/20" />

        {/* Decorative elements */}
        <div className="pointer-events-none absolute right-[-120px] top-[15%] hidden h-[550px] w-[550px] rounded-full border border-[#D5B66D]/15 lg:block" />
        <div className="pointer-events-none absolute right-[-65px] top-[21%] hidden h-[440px] w-[440px] rounded-full border border-[#D5B66D]/20 lg:block" />
        <div className="pointer-events-none absolute right-[-15px] top-[28%] hidden h-[330px] w-[330px] rounded-full border border-[#D5B66D]/15 lg:block" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="hero-reveal flex items-center gap-3">
              <span className="h-px w-12 bg-[#D5B66D]" />

              <span className="text-[10px] font-medium uppercase tracking-[3px] text-[#E5C77E] sm:text-xs sm:tracking-[4px]">
                {siteConfig.tagline}
              </span>
            </div>

            {/* Heading */}
            <h1 className="hero-reveal hero-delay-1 mt-7 font-serif text-[43px] font-medium leading-[1.12] tracking-[-1px] text-white sm:text-6xl md:text-7xl lg:text-[88px]">
              Your Love Story,
              <br />
              <span className="italic text-[#D5B66D]">
                Beautifully
              </span>{" "}
              Planned.
            </h1>

            {/* Description */}
            <p className="hero-reveal hero-delay-2 mt-7 max-w-xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              From the first little detail to the last dance, discover trusted
              wedding professionals and create a celebration that feels uniquely
              yours.
            </p>

            {/* Buttons */}
            <div className="hero-reveal hero-delay-3 mt-9 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href={siteConfig.routes.services}
                className="group inline-flex items-center gap-3 rounded-full bg-[#D5B66D] px-6 py-3.5 text-xs font-semibold text-[#183D2D] transition duration-300 hover:bg-[#E8CD91] sm:px-8 sm:py-4 sm:text-sm"
              >
                Explore Wedding Services
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href={siteConfig.routes.signUp}
                className="inline-flex items-center gap-3 rounded-full border border-white/35 px-6 py-3.5 text-xs font-medium text-white transition duration-300 hover:border-[#D5B66D] hover:bg-white/5 hover:text-[#D5B66D] sm:px-8 sm:py-4 sm:text-sm"
              >
                Start Your Journey
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="hero-reveal hero-delay-4 mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/15 pt-7">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-[#D5B66D]" />
                <span className="text-xs text-white/70">
                  Trusted Professionals
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Heart size={16} className="text-[#D5B66D]" />
                <span className="text-xs text-white/70">
                  Thoughtful Planning
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#D5B66D]" />
                <span className="text-xs text-white/70">
                  Your Dream Celebration
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#D5B66D]/60 to-transparent" />

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-8 hidden flex-col items-center gap-3 text-white/50 lg:flex">
          <span className="text-[9px] uppercase tracking-[3px]">Scroll</span>
          <span className="h-10 w-px bg-gradient-to-b from-[#D5B66D] to-transparent" />
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
      <section className="px-5 py-20 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Section heading */}
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#B4934C]" />
                <p className="text-[10px] font-medium uppercase tracking-[3px] text-[#B4934C]">
                  Handpicked for your day
                </p>
              </div>

              <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                Beautiful Services,
                <br />
                <span className="italic text-[#B4934C]">Wonderful Memories.</span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#747B73]">
                Explore talented professionals who make your wedding dreams come
                to life with care, creativity and a touch of magic.
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
              {services.map((service, index) => {
                const serviceId = service._id || service.id || String(index);

                return (
                  <Link
                    key={serviceId}
                    href={`${siteConfig.routes.services}/${serviceId}`}
                    className="service-card group overflow-hidden rounded-2xl border border-[#E8E1D3] bg-white transition duration-500 hover:-translate-y-1.5 hover:border-[#D5B66D]/60 hover:shadow-[0_20px_50px_rgba(24,61,45,0.10)]"
                  >
                    {/* Image */}
                    <div className="relative h-[260px] overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url('${getServiceImage(service)}')`,
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#102F23]/60 via-transparent to-[#102F23]/5" />

                      {/* Category */}
                      <span className="absolute left-4 top-4 rounded-full border border-[#D5B66D]/30 bg-[#183D2D]/90 px-4 py-2 text-[9px] font-medium uppercase tracking-[1.5px] text-[#D5B66D] backdrop-blur-md">
                        {service.category || "Wedding Service"}
                      </span>

                      {/* Heart */}
                      <span className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#183D2D] transition group-hover:bg-[#D5B66D]">
                        <Heart size={15} />
                      </span>

                      {/* Image bottom label */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80">
                        <MapPin size={12} />
                        <span className="text-[10px]">
                          {service.city || service.location || "Wedding Professional"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      <div className="mb-3 flex items-center gap-1 text-[#C3A45D]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={11}
                            fill="currentColor"
                          />
                        ))}

                        <span className="ml-2 text-[10px] text-[#8C9289]">
                          Featured
                        </span>
                      </div>

                      <h3 className="font-serif text-xl leading-snug text-[#183D2D] transition group-hover:text-[#B4934C]">
                        {getServiceName(service)}
                      </h3>

                      <p className="mt-2 line-clamp-2 min-h-[48px] text-xs leading-6 text-[#747B73]">
                        {service.description ||
                          "Discover an unforgettable wedding experience with our trusted professionals."}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E8E1D3] pt-4">
                        <span className="text-[10px] uppercase tracking-wider text-[#8C9289]">
                          Starting from
                        </span>

                        <span className="font-medium text-sm text-[#183D2D]">
                          {getServicePrice(service)}
                        </span>
                      </div>

                      {/* View Details CTA */}
                      <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#183D2D] px-5 py-3 text-xs font-semibold text-white transition duration-300 group-hover:bg-[#D5B66D] group-hover:text-[#183D2D]">
                        View Details
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
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


      {/* ================= GLOBAL HOMEPAGE ANIMATIONS ================= */}
      <style jsx global>{`
        @keyframes wedplanFadeUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wedplanFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-12px) rotate(2deg);
          }
        }

        @keyframes wedplanSlowZoom {
          from {
            transform: scale(1);
          }

          to {
            transform: scale(1.06);
          }
        }

        .hero-reveal {
          animation: wedplanFadeUp 0.85s ease-out both;
        }

        .hero-delay-1 {
          animation-delay: 0.12s;
        }

        .hero-delay-2 {
          animation-delay: 0.25s;
        }

        .hero-delay-3 {
          animation-delay: 0.4s;
        }

        .hero-delay-4 {
          animation-delay: 0.55s;
        }

        .service-card,
        .category-card {
          will-change: transform;
        }

        .category-card {
          animation: wedplanFadeUp 0.7s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}