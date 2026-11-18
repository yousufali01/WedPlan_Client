"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  ShieldCheck,
  BriefcaseBusiness,
  Star,
} from "lucide-react";

import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/subscription/mine`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load subscription.");
      }

      setSubscription(data.subscription);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
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

      const response = await fetch(`${API_URL}/api/v1/subscription/upgrade`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to upgrade plan.");
      }

      toast.success("Premium plan activated successfully!");
      await fetchSubscription();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upgrade failed.");
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-gold">
          <Crown size={22} />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Vendor Membership
          </span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Subscription Plans
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Choose the plan that fits your wedding business. Premium unlocks
          unlimited services and featured placement.
        </p>
      </div>

      {/* Active Plan Status */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Active Plan Status
            </p>

            <h2 className="mt-2 font-heading text-2xl font-bold">
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
            <p className="text-sm text-muted-foreground">Active Services</p>

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
      </div>

      {/* Plans */}
      <div>
        <div className="mb-5">
          <h2 className="font-heading text-2xl font-bold">Choose Your Plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upgrade your membership as your business grows.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isPremium = plan.id !== "free";
            const isRecommended = plan.id === "premium_monthly";

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isRecommended
                    ? "border-gold ring-1 ring-gold/30"
                    : "border-border"
                }`}
              >
                {/* Badge */}
                <div className="mb-5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isPremium ? (
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
                <div className="my-6 border-b border-border pb-6">
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
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check size={13} strokeWidth={3} />
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
                      <ShieldCheck size={17} />
                      Current Plan
                    </button>
                  ) : isPremium ? (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading !== null}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isRecommended
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-primary bg-transparent text-primary hover:bg-primary/10"
                      }`}
                    >
                      {upgrading === plan.id ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          Upgrade to Premium
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground"
                    >
                      Free Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold" />

        <p className="text-sm leading-6 text-muted-foreground">
          Premium activation is currently in demo mode. No real payment is
          processed. Payment integration will be added later.
        </p>
      </div>
    </div>
  );
}
