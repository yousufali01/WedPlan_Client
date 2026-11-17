"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Store,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
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

export default function AdminDashboardPage() {
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [pendingVendors, setPendingVendors] = React.useState<PendingVendor[]>([]);
  const [servicesCount, setServicesCount] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);

  const fetchAdminData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, pendingRes, servicesRes] = await Promise.allSettled([
        apiRequest<{ users: UserRecord[]; total: number }>("/api/v1/admin/users"),
        apiRequest<{ vendors: PendingVendor[]; total: number }>("/api/v1/admin/vendors/pending"),
        apiRequest<{ services: unknown[]; total: number }>("/api/v1/admin/services"),
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.users) {
        setUsers(usersRes.value.users);
      }
      if (pendingRes.status === "fulfilled" && pendingRes.value.vendors) {
        setPendingVendors(pendingRes.value.vendors);
      }
      if (servicesRes.status === "fulfilled" && typeof servicesRes.value.total === "number") {
        setServicesCount(servicesRes.value.total);
      }
    } catch (err) {
      toast.error("Could not fetch admin data", {
        description: err instanceof Error ? err.message : "Please check backend connection.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAdminData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAdminData]);

  const handleVendorApproval = async (vendorId: string, approved: boolean) => {
    setActionInProgress(vendorId);
    try {
      await apiRequest(`/api/v1/admin/vendors/${vendorId}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ approved }),
      });

      toast.success(
        approved ? "Vendor approved successfully!" : "Vendor application rejected."
      );

      // Remove from pending list
      setPendingVendors((prev) => prev.filter((v) => v.id !== vendorId));
      void fetchAdminData();
    } catch (err) {
      toast.error("Failed to update vendor status", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "customer" | "vendor" | "admin") => {
    setActionInProgress(userId);
    try {
      await apiRequest(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      toast.success(`User role updated to ${newRole}`);
      void fetchAdminData();
    } catch (err) {
      toast.error("Failed to update role", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Admin Panel
              </span>
            </div>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Platform Administration
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review vendor applications, manage user privileges, and monitor platform health.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            disabled={isLoading}
            className="w-fit self-start gap-1.5 sm:self-auto"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh Data
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
              <Users className="size-4 text-primary" aria-hidden="true" />
            </div>
            <p className="font-heading text-3xl font-semibold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Registered on WedPlan</p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Pending Vendors</span>
              <Clock className="size-4 text-amber-600" aria-hidden="true" />
            </div>
            <p className="font-heading text-3xl font-semibold text-amber-600">
              {pendingVendors.length}
            </p>
            <p className="text-xs text-muted-foreground">Awaiting your approval</p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Services</span>
              <Store className="size-4 text-primary" aria-hidden="true" />
            </div>
            <p className="font-heading text-3xl font-semibold">{servicesCount}</p>
            <p className="text-xs text-muted-foreground">Catalog listings</p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">System Status</span>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="font-heading text-2xl font-semibold text-emerald-600">Connected</p>
            <p className="text-xs text-muted-foreground">MongoDB & Better Auth live</p>
          </div>
        </div>

        {/* Section 1: Pending Vendor Approvals */}
        <section className="mt-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Pending Vendor Approvals
              </h2>
              <p className="text-xs text-muted-foreground">
                Vendors cannot publish services until approved.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
              {pendingVendors.length} Pending
            </span>
          </div>

          {isLoading ? (
            <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-border bg-card">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : pendingVendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <CheckCircle2 className="size-8 text-emerald-600" aria-hidden="true" />
              <p className="font-medium text-foreground">No pending vendor applications</p>
              <p className="text-xs text-muted-foreground">
                All vendor profiles have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="default">
                      {vendor.image && <AvatarImage src={vendor.image} alt={vendor.name} />}
                      <AvatarFallback>
                        {vendor.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{vendor.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{vendor.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionInProgress === vendor.id}
                      onClick={() => handleVendorApproval(vendor.id, false)}
                      className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <XCircle className="size-3.5" aria-hidden="true" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={actionInProgress === vendor.id}
                      onClick={() => handleVendorApproval(vendor.id, true)}
                      className="gap-1"
                    >
                      {actionInProgress === vendor.id ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      )}
                      Approve Vendor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: User Registry */}
        <section className="mt-12 flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">User Management</h2>
            <p className="text-xs text-muted-foreground">
              Inspect user accounts and manage permission tiers.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="divide-y divide-border">
              {users.slice(0, 15).map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      {u.image && <AvatarImage src={u.image} alt={u.name} />}
                      <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{u.name}</p>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                              : u.role === "vendor"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-primary/10 text-primary"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>

                  {u.role !== "admin" && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {u.role === "customer" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionInProgress === u.id}
                          onClick={() => handleRoleChange(u.id, "vendor")}
                          className="h-8 text-xs"
                        >
                          Promote to Vendor
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionInProgress === u.id}
                          onClick={() => handleRoleChange(u.id, "customer")}
                          className="h-8 text-xs"
                        >
                          Set as Customer
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
