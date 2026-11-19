"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Crown,
  Loader2,
  ShieldCheck,
  Star,
  BriefcaseBusiness,
  RefreshCw,
  CreditCard,
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
  paymentStatus?: string;
  isPremium?: boolean;
  expired?: boolean;
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
      "Access to 3 Recent Booking Events",
      "Basic Vendor Dashboard",
      "Standard Customer Inquiries",
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
      "Unlimited Booking Requests & Events Access",
      "Premium Vendor Badge",
      "Featured Service Placement",
      "Priority Customer Inquiries",
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
      "Unlimited Booking Requests & Events Access",
      "Premium Vendor Badge",
      "Featured Service Placement",
      "Priority Customer Inquiries",
      "All Free Plan Features",
    ],
  },
];

function SubscriptionContent() {
  const searchParams = useSearchParams();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  const [downgrading, setDowngrading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sessionId = searchParams.get("session_id");
  const isSuccess = searchParams.get("success") === "true";
  const isCanceled = searchParams.get("canceled") === "true";
  const planParam = searchParams.get("plan");

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

  const clearCheckoutParams = useCallback(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  // Handle Stripe Checkout redirects (success, failure or cancelled).
  useEffect(() => {
    if (isSuccess && sessionId) {
      let active = true;

      const verifyPayment = async () => {
        setIsVerifying(true);
        try {
          const res = await apiRequest<{
            success: boolean;
            message: string;
            subscription: Subscription;
          }>("/api/v1/subscription/verify-stripe-session", {
            method: "POST",
            body: JSON.stringify({
              sessionId,
              plan: planParam || "premium_monthly",
            }),
          });

          if (active) {
            toast.success(
              res.message ||
                "Payment verified! Your account has been upgraded to Premium.",
            );
            if (res.subscription) setSubscription(res.subscription);
            clearCheckoutParams();
            await fetchSubscription();
          }
        } catch (err) {
          if (active) {
            toast.error(
              err instanceof Error
                ? err.message
                : "Unable to verify payment with Stripe.",
            );
            // Never leave the success params in the URL — that would retry
            // verification forever. The account stays on Free.
            clearCheckoutParams();
          }
        } finally {
          if (active) setIsVerifying(false);
        }
      };

      void verifyPayment();

      return () => {
        active = false;
      };
    }

    if (isSuccess && !sessionId) {
      toast.error(
        "Payment verification link is incomplete. No plan was changed.",
      );
      clearCheckoutParams();
    } else if (isCanceled) {
      toast.info("Payment was cancelled. You remain on the Free plan.");
      clearCheckoutParams();
    }
  }, [
    isSuccess,
    sessionId,
    planParam,
    isCanceled,
    clearCheckoutParams,
    fetchSubscription,
  ]);

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === "free" || upgrading) return;

    try {
      setUpgrading(planId);

      // The backend derives vendorId/email from the authenticated session —
      // nothing about the buyer is trusted from the browser.
      const data = await apiRequest<{
        success: boolean;
        url: string;
        sessionId?: string;
      }>("/api/v1/subscription/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ plan: planId }),
      });

      if (!data.url) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      toast.loading("Redirecting to secure Stripe Checkout...");
      window.location.assign(data.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to initiate payment.",
      );
      setUpgrading(null);
    }
  };

  const handleDowngrade = async () => {
    if (
      !window.confirm(
        "Switch back to the Free plan? Only 3 active services and 3 booking events will be allowed.",
      )
    ) {
      return;
    }

    setDowngrading(true);

    try {
      await apiRequest("/api/v1/subscription/downgrade", { method: "POST" });
      toast.success("Switched to the Free plan.");
      await fetchSubscription();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to switch plans.",
      );
    } finally {
      setDowngrading(false);
    }
  };

  if (loading || isVerifying) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {isVerifying ? "Verifying your Stripe payment..." : "Loading subscription details..."}
        </p>
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";
  // Backend normalises expired/inactive premium to Free; fall back to the
  // local check only for an older server response.
  const isPremiumActive =
    subscription?.isPremium !== undefined
      ? subscription.isPremium === true
      : ["premium_monthly", "premium_yearly"].includes(currentPlan) &&
        subscription?.status === "active";

  return (
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
              {isPremiumActive ? "Premium Active" : "Stripe Checkout Ready"}
            </span>
          </div>

          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-[34px]">
            Subscription Plans
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose the plan that fits your wedding business. Upgrade to Premium for
            unlimited services, all booking events access, and featured placement.
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
              <Crown className={`size-5 ${isPremiumActive ? "text-gold" : "text-muted-foreground"}`} />
              {subscription?.planName || "Free"} Plan
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isPremiumActive ? "bg-emerald-100 text-emerald-800" : "bg-primary/10 text-primary"
              }`}>
                {isPremiumActive ? "Active Premium Member" : "Free Tier"}
              </span>

              {subscription?.expiresAt && (
                <span className="text-xs text-muted-foreground">
                  Valid until:{" "}
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
                  {subscription.remainingServices} service slots remaining
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
            Pay securely with Stripe credit/debit card to instantly unlock all features.
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
                    : isCurrent
                      ? "border-primary/40 ring-1 ring-primary/20"
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
                    <div className="flex flex-col gap-2">
                      <button
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
                      >
                        <ShieldCheck className="size-4" />
                        Current Plan
                      </button>

                      {isPremiumPlan && (
                        <button
                          onClick={() => void handleDowngrade()}
                          disabled={downgrading}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e9e1d8] bg-white px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downgrading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : null}
                          Switch to Free Plan
                        </button>
                      )}
                    </div>
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
                          Connecting to Stripe...
                        </>
                      ) : (
                        <>
                          <CreditCard className="size-4" />
                          Pay with Stripe (${plan.price})
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

      {/* Security Note */}
      <div className="flex items-start gap-3 rounded-xl border border-[#eadbb5] bg-[#fffdf7] p-4">
        <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold" />

        <p className="text-sm leading-6 text-muted-foreground">
          Payments are securely encrypted and processed by Stripe. All major credit and debit
          cards are accepted. Free plan permits up to 3 services and 3 booking events; Premium
          grants unlimited access.
        </p>
      </div>
    </div>
  );
}

export default function VendorSubscriptionPage() {
  return (
    <ProtectedRoute allowedRoles={["vendor", "admin"]}>
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        }
      >
        <SubscriptionContent />
      </Suspense>
    </ProtectedRoute>
  );
}
