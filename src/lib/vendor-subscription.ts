/**
 * Single source of truth for the vendor subscription state.
 *
 * `GET /api/v1/subscription/mine` returns the plan fields at the TOP LEVEL of
 * the JSON body, while `subscription` is only the raw Mongo document (and is
 * `null` for free vendors):
 *
 *   { success, plan, status, paymentStatus, expiresAt, isPremium, subscription }
 *
 * Reading `data.subscription.planName` (a field the server never sends) was
 * the root cause of the "always Free Plan" / "0 Unlimited" / sidebar crash
 * bugs. Always go through `fetchVendorSubscription()` instead.
 */

import { apiRequest } from "@/lib/api";

export type PlanId = "free" | "premium_monthly" | "premium_yearly";

export const PREMIUM_PLAN_IDS = ["premium_monthly", "premium_yearly"] as const;

/** Display name for a plan id, used everywhere a plan label is rendered. */
export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free Plan",
  premium_monthly: "Premium Monthly",
  premium_yearly: "Premium Yearly",
};

/** Raw Mongo `subscriptions` document (only present for paying vendors). */
export type RawSubscription = {
  plan?: string;
  status?: string;
  paymentStatus?: string;
  expiresAt?: string | Date | null;
  amount?: number;
  currency?: string;
  cancelAtPeriodEnd?: boolean;
};

/** Normalised subscription state every vendor page should consume. */
export type VendorSubscription = {
  plan: PlanId;
  /** Human readable label, e.g. "Premium Monthly". */
  planName: string;
  status: string;
  paymentStatus: string;
  expiresAt: string | null;
  /** Authoritative premium flag computed server-side (plan + status + paid + not expired). */
  isPremium: boolean;
  /** A premium plan is recorded but no longer active (expired or cancelled). */
  expired: boolean;
  /** Raw document, handy for `cancelAtPeriodEnd` / amounts. */
  raw: RawSubscription | null;
};

export const FREE_SUBSCRIPTION: VendorSubscription = {
  plan: "free",
  planName: PLAN_LABELS.free,
  status: "inactive",
  paymentStatus: "unpaid",
  expiresAt: null,
  isPremium: false,
  expired: false,
  raw: null,
};

/** Free vendors may publish this many active services. */
export const FREE_SERVICE_LIMIT = 3;

/** Free vendors may view this many recent booking events. */
export const FREE_BOOKING_LIMIT = 3;

type SubscriptionResponse = Partial<{
  plan: string;
  status: string;
  paymentStatus: string;
  expiresAt: string | null;
  isPremium: boolean;
  subscription: RawSubscription | null;
}>;

function toPlanId(value: unknown): PlanId {
  return value === "premium_monthly" || value === "premium_yearly"
    ? value
    : "free";
}
function normalizeDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  return value;
}
/** Turn the server response (or a partial/legacy one) into safe state. */
export function normalizeSubscription(
  response: SubscriptionResponse | null | undefined,
): VendorSubscription {
  if (!response) return FREE_SUBSCRIPTION;

  const raw = response.subscription ?? null;
  const plan = toPlanId(response.plan ?? raw?.plan);

  const isPremium =
    typeof response.isPremium === "boolean"
      ? response.isPremium
      : PREMIUM_PLAN_IDS.includes(plan as (typeof PREMIUM_PLAN_IDS)[number]) &&
        response.status === "active";

  return {
    plan,
    planName: PLAN_LABELS[plan],
    status: response.status ?? raw?.status ?? "inactive",
    paymentStatus: response.paymentStatus ?? raw?.paymentStatus ?? "unpaid",
    expiresAt: normalizeDate(response.expiresAt ?? raw?.expiresAt),
    isPremium,
    // A premium plan on record that is not active anymore => expired/cancelled.
    expired: !isPremium && plan !== "free",
    raw,
  };
}

/** Fetch + normalise the signed-in vendor's subscription. */
export async function fetchVendorSubscription(
  signal?: AbortSignal,
): Promise<VendorSubscription> {
  const data = await apiRequest<SubscriptionResponse>(
    "/api/v1/subscription/mine",
    signal ? { signal } : {},
  );

  return normalizeSubscription(data);
}

/* ───────────────────────── Plan catalogue ───────────────────────── */

export type PlanCatalogEntry = {
  id: PlanId;
  name: string;
  amount: number;
  currency: string;
  durationDays: number;
};

/**
 * Fallback amounts used only when the server cannot report a price
 * (`amount` is `null` because STRIPE_MONTHLY_PRICE / STRIPE_YEARLY_PRICE are
 * not configured). The server price always wins when it is a valid number so
 * the displayed price can never disagree with what Stripe charges.
 */
const FALLBACK_AMOUNTS: Record<string, number> = {
  premium_monthly: 29,
  premium_yearly: 290,
};

export type PlanAmounts = Record<string, number>;

/** Fetch `GET /api/v1/subscription/plans` and return `{ planId: amount }`. */
export async function fetchPlanAmounts(
  signal?: AbortSignal,
): Promise<PlanAmounts> {
  const amounts: PlanAmounts = { ...FALLBACK_AMOUNTS, free: 0 };

  try {
    const data = await apiRequest<{ plans?: PlanCatalogEntry[] }>(
      "/api/v1/subscription/plans",
      signal ? { signal } : {},
    );

    for (const plan of data.plans ?? []) {
      if (typeof plan?.amount === "number" && Number.isFinite(plan.amount)) {
        amounts[plan.id] = plan.amount;
      }
    }
  } catch {
    // Keep the fallback amounts — the page still renders and the checkout
    // endpoint surfaces its own configuration error if it is misconfigured.
  }

  return amounts;
}

/** Price label for a plan, e.g. `$29`. */
export function formatPlanPrice(amount: number | undefined): string {
  if (amount === undefined || !Number.isFinite(amount)) return "—";
  return `$${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}
