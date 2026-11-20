"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Loader2,
  Receipt,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/api";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "customer" | "vendor" | "admin";
  vendorApproved?: boolean;
  createdAt?: string;
};

type PendingVendor = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: string;
};

type AdminUsersResponse = {
  users: UserRecord[];
  total: number;
};

type PendingVendorsResponse = {
  vendors: PendingVendor[];
  total: number;
};

type AdminServicesResponse = {
  services: unknown[];
  total: number;
};

type AdminTransactionsResponse = {
  total: number;
};

export default function AdminDashboardOverviewPage() {
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [pendingVendors, setPendingVendors] = React.useState<PendingVendor[]>(
    [],
  );

  const [servicesCount, setServicesCount] = React.useState(0);
  const [transactionsCount, setTransactionsCount] = React.useState(0);

  const [isLoading, setIsLoading] = React.useState(true);
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(
    null,
  );

  const isFetching = React.useRef(false);
  const isMounted = React.useRef(false);

  // ================= FETCH ADMIN DATA =================

  const fetchAdminData = React.useCallback(async (showLoader = true) => {
    if (isFetching.current) return;

    isFetching.current = true;

    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const [usersRes, pendingRes, servicesRes, transRes] =
        await Promise.allSettled([
          apiRequest<AdminUsersResponse>("/api/v1/admin/users"),

          apiRequest<PendingVendorsResponse>("/api/v1/admin/vendors/pending"),

          apiRequest<AdminServicesResponse>("/api/v1/admin/services"),

          apiRequest<AdminTransactionsResponse>("/api/v1/admin/transactions"),
        ]);

      if (!isMounted.current) return;

      const errors: string[] = [];

      // Users
      if (usersRes.status === "fulfilled") {
        const response = usersRes.value;

        if (Array.isArray(response?.users)) {
          setUsers(response.users);
        } else {
          errors.push("Users response format is invalid.");
        }
      } else {
        errors.push("Could not load users.");
      }

      // Pending Vendors
      if (pendingRes.status === "fulfilled") {
        const response = pendingRes.value;

        if (Array.isArray(response?.vendors)) {
          setPendingVendors(response.vendors);
        } else {
          errors.push("Pending vendors response format is invalid.");
        }
      } else {
        errors.push("Could not load pending vendors.");
      }

      // Services
      if (servicesRes.status === "fulfilled") {
        const response = servicesRes.value;

        if (typeof response?.total === "number") {
          setServicesCount(response.total);
        } else if (Array.isArray(response?.services)) {
          setServicesCount(response.services.length);
        } else {
          errors.push("Services response format is invalid.");
        }
      } else {
        errors.push("Could not load services.");
      }

      // Transactions
      if (transRes.status === "fulfilled") {
        const response = transRes.value;

        if (typeof response?.total === "number") {
          setTransactionsCount(response.total);
        } else {
          errors.push("Transactions response format is invalid.");
        }
      } else {
        errors.push("Could not load transactions.");
      }

      if (errors.length > 0) {
        toast.error("Some dashboard data could not be loaded.", {
          description: errors.join(" "),
        });
      }
    } catch (error) {
      if (!isMounted.current) return;

      toast.error("Could not fetch admin data.", {
        description:
          error instanceof Error
            ? error.message
            : "Please check your backend connection.",
      });
    } finally {
      isFetching.current = false;

      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // ================= INITIAL DATA LOAD =================

  React.useEffect(() => {
    isMounted.current = true;

    const timer = setTimeout(() => {
      void fetchAdminData();
    }, 0);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [fetchAdminData]);
  // ================= VENDOR APPROVAL / REJECTION =================

  const handleVendorApproval = async (vendorId: string, approved: boolean) => {
    if (actionInProgress) return;

    setActionInProgress(vendorId);

    try {
      await apiRequest(
        `/api/v1/admin/vendors/${encodeURIComponent(vendorId)}/approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approved }),
        },
      );

      toast.success(
        approved
          ? "Vendor approved successfully!"
          : "Vendor application rejected.",
      );

      setPendingVendors((prev) =>
        prev.filter((vendor) => vendor.id !== vendorId),
      );

      // Refresh remaining dashboard information.
      void fetchAdminData(false);
    } catch (error) {
      toast.error("Failed to update vendor status.", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // ================= RENDER =================

  return (
    <div className="flex flex-col gap-8 min-w-0 w-full">
      {/* Overview Heading */}

      <div className="flex flex-col justify-between gap-4 border-b border-[#e9e1d8] pb-5 sm:flex-row sm:items-center min-w-0">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Platform Administration
            </span>

            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
              Admin Governance
            </span>
          </div>

          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Admin Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor platform activity, moderate wedding vendors, inspect catalog
            services, and review financials.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchAdminData()}
          disabled={isLoading}
          className="w-fit shrink-0 gap-2 border-[#e9e1d8] bg-white"
        >
          <RefreshCw
            className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards Row */}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}

        <Link
          href="/admin/users"
          className="flex min-w-0 flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Users
            </span>
            <Users className="size-4 shrink-0 text-primary" />
          </div>

          <p className="font-heading text-3xl font-semibold tabular-nums">
            {isLoading ? "—" : users.length}
          </p>

          <p className="text-xs text-muted-foreground">
            Manage roles & access →
          </p>
        </Link>

        {/* Pending Vendors */}

        <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pending Vendors
            </span>
            <Clock className="size-4 shrink-0 text-amber-600" />
          </div>

          <p className="font-heading text-3xl font-semibold tabular-nums text-amber-600">
            {isLoading ? "—" : pendingVendors.length}
          </p>

          <p className="text-xs text-muted-foreground">
            Awaiting your approval
          </p>
        </div>

        {/* Total Services */}

        <Link
          href="/admin/services"
          className="flex min-w-0 flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Listed Services
            </span>
            <BriefcaseBusiness className="size-4 shrink-0 text-emerald-600" />
          </div>

          <p className="font-heading text-3xl font-semibold tabular-nums">
            {isLoading ? "—" : servicesCount}
          </p>

          <p className="text-xs text-muted-foreground">Moderate catalog →</p>
        </Link>

        {/* Total Transactions */}

        <Link
          href="/admin/transactions"
          className="flex min-w-0 flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Transactions
            </span>
            <Receipt className="size-4 shrink-0 text-gold" />
          </div>

          <p className="font-heading text-3xl font-semibold tabular-nums text-foreground">
            {isLoading ? "—" : transactionsCount}
          </p>

          <p className="text-xs text-muted-foreground">
            View financial ledger →
          </p>
        </Link>
      </div>

      {/* Quick Action Navigation Grid */}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/users"
          className="group min-w-0 rounded-2xl border border-[#e9e1d8] bg-white p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>

          <h2 className="font-heading text-base font-bold text-foreground transition group-hover:text-primary">
            Manage Users
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Search users, adjust account privileges, promote to vendor or admin.
          </p>

          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
            Open Users
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/services"
          className="group min-w-0 rounded-2xl border border-[#e9e1d8] bg-white p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-5" />
          </div>

          <h2 className="font-heading text-base font-bold text-foreground transition group-hover:text-primary">
            Manage Services
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Review submitted wedding packages, approve pending services, remove
            violations.
          </p>

          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
            Open Services
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/transactions"
          className="group min-w-0 rounded-2xl border border-[#e9e1d8] bg-white p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="size-5" />
          </div>

          <h2 className="font-heading text-base font-bold text-foreground transition group-hover:text-primary">
            Transactions
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Audit couple booking volumes and vendor subscription settlements.
          </p>

          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
            Open Ledger
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Pending Vendor Applications Queue */}

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e1d8] bg-white shadow-sm">
        <div className="border-b border-[#e9e1d8] p-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Pending Vendor Approvals
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Vendors awaiting platform verification to publish wedding
                services.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              {pendingVendors.length} In Queue
            </span>
          </div>
        </div>

        {/* Loading State */}

        {isLoading ? (
          <div className="flex min-h-[150px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : pendingVendors.length === 0 ? (
          /* Empty State */

          <div className="flex min-h-[160px] flex-col items-center justify-center p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </div>

            <h3 className="mt-2 text-sm font-semibold text-foreground">
              All Caught Up!
            </h3>

            <p className="text-xs text-muted-foreground">
              There are no pending vendor applications awaiting review.
            </p>
          </div>
        ) : (
          /* Pending Vendors List */

          <div className="divide-y divide-[#eee8e0]">
            {pendingVendors.map((vendor) => {
              const isWorking = actionInProgress === vendor.id;

              return (
                <div
                  key={vendor.id}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-[#faf9f6] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size="default" className="shrink-0">
                      {vendor.image && (
                        <AvatarImage src={vendor.image} alt={vendor.name} />
                      )}

                      <AvatarFallback className="bg-amber-100 font-semibold text-amber-700">
                        {vendor.name?.slice(0, 2).toUpperCase() || "VN"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {vendor.name}
                      </p>

                      <p className="break-all text-xs text-muted-foreground">
                        {vendor.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {/* Approve */}

                    <Button
                      size="sm"
                      disabled={Boolean(actionInProgress)}
                      onClick={() => void handleVendorApproval(vendor.id, true)}
                      className="gap-1.5 bg-emerald-700 text-white hover:bg-emerald-800"
                    >
                      {isWorking ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      Approve
                    </Button>

                    {/* Reject */}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={Boolean(actionInProgress)}
                      onClick={() =>
                        void handleVendorApproval(vendor.id, false)
                      }
                      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {isWorking ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
