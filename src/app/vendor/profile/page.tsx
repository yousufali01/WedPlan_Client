"use client";

import Link from "next/link";

import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Crown,
  Settings,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type VendorProfile = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  businessName?: string;
  studioName?: string;
  vendorApproved?: boolean;
  plan?: string;
  subscriptionPlan?: string;
  subscription?: {
    plan?: string;
    name?: string;
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function VendorProfilePage() {
  const { user } = useAuth();
  const vendor = user as VendorProfile | null;

  const displayName =
    vendor?.businessName || vendor?.studioName || vendor?.name || "Your Studio";

  const planName =
    vendor?.subscription?.plan ||
    vendor?.subscription?.name ||
    vendor?.subscriptionPlan ||
    vendor?.plan ||
    "Free Plan";

  const isPremium = planName.toLowerCase().includes("premium");
  const isApproved = vendor?.vendorApproved === true;

  return (
    <ProtectedRoute allowedRoles={["vendor", "admin"]}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-b border-[#e9e1d8] pb-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-[1.5px] text-primary">
            Vendor Workspace
          </p>

          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-[34px]">
            Profile Settings
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review your vendor account details, approval status and subscription
            plan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Account card */}
          <section className="rounded-xl border border-[#e9e1d8] bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="size-16">
                {vendor?.avatarUrl && (
                  <AvatarImage src={vendor.avatarUrl} alt={displayName} />
                )}
                <AvatarFallback className="font-heading text-xl">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-xl font-bold">
                    {displayName}
                  </h2>

                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
                    Vendor Account
                  </span>
                </div>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {vendor?.email || "No email linked"}
                </p>

                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      isApproved
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isApproved ? (
                      <BadgeCheck className="size-3" />
                    ) : (
                      <Clock3 className="size-3" />
                    )}
                    {isApproved ? "Approved Partner" : "Pending Approval"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-[#e9e1d8] pt-5 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e9e1d8] bg-[#faf9f6] p-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <BriefcaseBusiness className="size-4 text-primary" />
                  Business Name
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {vendor?.businessName || vendor?.studioName || "Not provided"}
                </p>
              </div>

              <div className="rounded-xl border border-[#e9e1d8] bg-[#faf9f6] p-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" />
                  Booking Visibility
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {isApproved
                    ? "Visible to couples"
                    : "Hidden until approved"}
                </p>
              </div>
            </div>
          </section>

          {/* Plan + actions */}
          <div className="flex flex-col gap-6">
            <section className="rounded-xl border border-[#eadbb5] bg-gradient-to-r from-[#fffdf7] via-white to-[#faf8f1] p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-gold" />
                <h3 className="font-heading text-lg font-bold">
                  Current Plan
                </h3>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Your vendor workspace is running on
              </p>

              <p className="mt-1 font-heading text-2xl font-bold">{planName}</p>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {isPremium
                  ? "Premium benefits are active: unlimited listings, featured placement and the premium vendor badge."
                  : "Free Plan includes up to 3 active service listings. Upgrade for unlimited growth."}
              </p>

              <Button
                variant={isPremium ? "outline" : "default"}
                size="sm"
                render={<Link href="/vendor/subscription" />}
                className="mt-4 w-full gap-2"
              >
                <Crown className="size-4" />
                {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
              </Button>
            </section>

            <section className="rounded-xl border border-[#e9e1d8] bg-white p-5 shadow-sm">
              <h3 className="font-heading text-lg font-bold">Quick Actions</h3>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  render={<Link href="/profile" />}
                  className="justify-start gap-2 border-[#e9e1d8] bg-white"
                >
                  <Settings className="size-4" />
                  Edit Account Details
                </Button>

                <Button
                  variant="outline"
                  render={<Link href="/vendor/services/new" />}
                  className="justify-start gap-2 border-[#e9e1d8] bg-white"
                >
                  <BriefcaseBusiness className="size-4" />
                  Add New Service
                </Button>

                <Button
                  variant="outline"
                  render={<Link href="/vendor/bookings" />}
                  className="justify-start gap-2 border-[#e9e1d8] bg-white"
                >
                  <CalendarDays className="size-4" />
                  View Booking Requests
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
