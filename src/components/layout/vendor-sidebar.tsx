"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Crown,
  Globe,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from "lucide-react";

import { useAuth, type AuthUser } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import {
  fetchVendorSubscription,
  FREE_SERVICE_LIMIT,
  type VendorSubscription,
} from "@/lib/vendor-subscription";

const vendorNavigation = [
  { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard, exact: true },
  { label: "My Services", href: "/vendor/services", icon: BriefcaseBusiness, exact: true },
  { label: "Add Service", href: "/vendor/services/new", icon: PlusCircle, exact: true },
  { label: "Booking Requests", href: "/vendor/bookings", icon: CalendarDays },
  { label: "Subscription", href: "/vendor/subscription", icon: Crown },
  { label: "Profile Settings", href: "/vendor/profile", icon: Settings },
  { label: "View Website", href: "/", icon: Globe, exact: true },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function VendorSidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [totalServices, setTotalServices] = React.useState(0);
  const [activeServices, setActiveServices] = React.useState(0);
  const [pendingBookings, setPendingBookings] = React.useState(0);
  const [subscription, setSubscription] = React.useState<VendorSubscription | null>(
    null,
  );

  React.useEffect(() => {
    let cancelled = false;

    void Promise.allSettled([
      apiRequest<{ services: { availability?: boolean }[] }>(
        "/api/v1/services/mine",
      ),
      apiRequest<{ bookings: { status?: string }[] }>("/api/v1/bookings/vendor"),
      fetchVendorSubscription(),
    ]).then(([servicesRes, bookingsRes, subscriptionRes]) => {
      if (cancelled) return;

      if (servicesRes.status === "fulfilled") {
        const services = servicesRes.value.services ?? [];
        setTotalServices(services.length);
        setActiveServices(
          services.filter((service) => service.availability !== false).length,
        );
      }

      if (bookingsRes.status === "fulfilled") {
        setPendingBookings(
          (bookingsRes.value.bookings ?? []).filter(
            (booking) => booking.status === "pending",
          ).length,
        );
      }

      // `fetchVendorSubscription` never rejects with a malformed payload, so a
      // rejected entry just leaves the previous (free) state in place.
      if (subscriptionRes.status === "fulfilled") {
        setSubscription(subscriptionRes.value);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const vendor = user;

  const vendorName =
    vendor?.businessName || vendor?.studioName || vendor?.name || "Your Studio";

  const isPremium = subscription?.isPremium === true;
  const planName = subscription?.planName || "Free Plan";
  const usedServices = activeServices || totalServices;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#e9e1d8] bg-white p-4 shadow-sm">
      {/* Workspace */}
      <div className="border-b border-[#e9e1d8] pb-5">
        <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted-foreground">
          Workspace
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">Vendor Portal</h2>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {isPremium ? "Premium" : "Free"}
          </span>
        </div>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {vendorName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex flex-col gap-2" aria-label="Vendor navigation">
        {vendorNavigation.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-3
                text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                }
              `}
            >
              <Icon className="size-[17px] shrink-0" />
              <span>{item.label}</span>

              {item.label === "Booking Requests" && pendingBookings > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pendingBookings}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Premium plan card */}
      <div className="mt-auto rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-gold" />
          <span className="text-sm font-semibold">{planName}</span>
        </div>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {isPremium
            ? "Enjoy your premium vendor benefits."
            : `${usedServices} of ${FREE_SERVICE_LIMIT} free service listings used.`}
        </p>

        {!isPremium && (
          <Link
            href="/vendor/subscription"
            onClick={onNavigate}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Explore Premium
            <ArrowUpRight className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
