"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Check,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

type PlanId = "free" | "premium_monthly" | "premium_yearly";

type Subscription = {
  plan: PlanId;
  status: string;
  planName: string;
  price: number;
  interval: string;
  activeServiceLimit: number | null;
  activeServices: number;
  remainingServices: number | null;
  expiresAt?: string;
};

const plans = [
  {
    id: "free" as PlanId,
    name: "Free Plan",
    description: "Ideal for boutique vendors getting started on WedPlan.",
    price: 0,
    interval: "month",
    badge: "Current Plan",
    features: [
      "Maximum 3 Active Services",
      "Basic Vendor Dashboard",
      "Booking Request Management",
    ],
  },
  {
    id: "premium_monthly" as PlanId,
    name: "Premium Monthly",
    description: "Built for established wedding studios scaling bookings.",
    price: 29,
    interval: "month",
    badge: "Recommended",
    features: [
      "Unlimited Active Services",
      "Premium Vendor Badge",
      "Featured Service Placement",
      "All Free Plan Features",
    ],
  },
  {
    id: "premium_yearly" as PlanId,
    name: "Premium Yearly",
    description: "Best for growing wedding businesses planning long-term.",
    price: 290,
    interval: "year",
    badge: "Best Value",
    features: [
      "Unlimited Active Services",
      "Premium Vendor Badge",
      "Featured Service Placement",
      "All Free Plan Features",
    ],
  },
];

export default function VendorSubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await apiRequest<{ subscription: Subscription }>(
        "/api/v1/subscription/mine",
      );

      setSubscription(data.subscription);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load subscription.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void fetchSubscription(), 0);
    return () => clearTimeout(timer);
  }, [fetchSubscription]);

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === "free" || upgrading) return;

    const confirmed = window.confirm(
      `Activate ${planId === "premium_monthly" ? "Premium Monthly" : "Premium Yearly"} as a demo subscription? No payment will be collected.`,
    );

    if (!confirmed) return;

    try {
      setUpgrading(planId);

      await apiRequest("/api/v1/subscription/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan: planId }),
      });

      toast.success("Premium plan activated successfully!");
      await fetchSubscription();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upgrade plan.",
      );
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";

  return (
    <ProtectedRoute allowedRoles={["vendor", "admin"]}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#e9e1d8] pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[1.5px] text-primary">
                Vendor Membership
              </span>

              <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold text-foreground">
                <Crown className="size-3 text-gold" />
                Premium Ready
              </span>
            </div>

            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-[34px]">
              Subscription Plans
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Choose the plan that fits your wedding business. Premium unlocks
              unlimited services and featured placement.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchSubscription()}
            className="w-fit gap-2 border-[#e9e1d8] bg-white"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>

        {/* Active Plan Status */}
        <section className="relative overflow-hidden rounded-xl border border-[#eadbb5] bg-gradient-to-r from-[#fffdf7] via-white to-[#faf8f1] p-5 shadow-sm sm:p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Active Plan Status
              </p>

              <h2 className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold">
                <Crown className="size-5 text-gold" />
                {subscription?.planName || "Free"} Plan
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {subscription?.status || "active"}
                </span>

                {subscription?.expiresAt && (
                  <span className="text-xs text-muted-foreground">
                    Expires:{" "}
                    {new Date(subscription.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-muted-foreground">Active Services</p>

              <p className="mt-1 text-3xl font-bold tabular-nums">
                <span className="text-primary">
                  {subscription?.activeServices ?? 0}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {subscription?.activeServiceLimit ?? "Unlimited"}
                </span>
              </p>

              {subscription?.remainingServices !== null &&
                subscription?.remainingServices !== undefined && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {subscription.remainingServices} slots remaining
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section>
          <div className="mb-5">
            <h2 className="font-heading text-xl font-bold">Choose Your Plan</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Upgrade your membership as your business grows.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isPremiumPlan = plan.id !== "free";
              const isRecommended = plan.id === "premium_monthly";

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                    isRecommended
                      ? "border-gold ring-1 ring-gold/30"
                      : "border-[#e9e1d8]"
                  }`}
                >
                  {/* Badge */}
                  <div className="mb-5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isPremiumPlan ? (
                        <Crown className="h-5 w-5 text-gold" />
                      ) : (
                        <BriefcaseBusiness className="h-5 w-5 text-primary" />
                      )}

                      <h3 className="font-heading text-xl font-bold">
                        {plan.name}
                      </h3>
                    </div>

                    {isRecommended && (
                      <span className="rounded-full bg-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground">
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className="min-h-12 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="my-6 border-b border-[#e9e1d8] pb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-4xl font-bold">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {plan.interval}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-4">
                    <p className="text-sm font-semibold">What&apos;s included</p>

                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-3" strokeWidth={3} />
                        </span>

                        <span className="text-sm leading-6 text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="mt-8">
                    {isCurrent ? (
                      <button
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
                      >
                        <ShieldCheck className="size-4" />
                        Current Plan
                      </button>
                    ) : isPremiumPlan ? (
                      <button
                        onClick={() => void handleUpgrade(plan.id)}
                        disabled={upgrading !== null}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          isRecommended
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-primary bg-transparent text-primary hover:bg-primary/10"
                        }`}
                      >
                        {upgrading === plan.id ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Activating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-4" />
                            Upgrade to Premium
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-[#e9e1d8] bg-[#faf9f6] px-4 py-3 text-sm font-semibold text-muted-foreground"
                      >
                        Free Plan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Note */}
        <div className="flex items-start gap-3 rounded-xl border border-[#eadbb5] bg-[#fffdf7] p-4">
          <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold" />

          <p className="text-sm leading-6 text-muted-foreground">
            Premium activation is currently in demo mode. No real payment is
            processed. Payment integration will be added later.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
