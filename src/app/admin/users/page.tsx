"use client";

import * as React from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Users,
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

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ users: UserRecord[]; total: number }>(
        "/api/v1/admin/users?limit=100"
      );
      if (res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      toast.error("Failed to fetch users", {
        description: err instanceof Error ? err.message : "Please check server connection.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: "customer" | "vendor" | "admin") => {
    setActionInProgress(userId);
    try {
      await apiRequest(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      toast.success(`User role changed to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error("Failed to update role", {
        description: err instanceof Error ? err.message : "Action denied.",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleVendorApproval = async (userId: string, approved: boolean) => {
    setActionInProgress(userId);
    try {
      await apiRequest(`/api/v1/admin/vendors/${userId}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ approved }),
      });

      toast.success(
        approved ? "Vendor approved successfully!" : "Vendor application rejected."
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, vendorApproved: approved } : u))
      );
    } catch (err) {
      toast.error("Approval action failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e9e1d8] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              User Management
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
              {users.length} Total Registered
            </span>
          </div>

          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Manage System Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promote or demote user roles, approve verified vendor onboarding, and enforce platform security.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchUsers()}
          disabled={isLoading}
          className="gap-2 border-[#e9e1d8] bg-white w-fit"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e9e1d8] bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#e6dfd5] bg-transparent py-2 pl-9 pr-3 text-xs outline-none focus:border-primary sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-muted-foreground">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-[#e6dfd5] bg-white px-3 py-2 text-xs font-medium outline-none cursor-pointer focus:border-primary"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="overflow-hidden rounded-2xl border border-[#e9e1d8] bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading platform users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <Users className="size-10 text-muted-foreground" />
            <h3 className="mt-3 font-heading text-lg font-semibold">No Users Found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              No registered user matches your current search criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#eee8e0]">
            {filteredUsers.map((u) => {
              const isWorking = actionInProgress === u.id;

              return (
                <div
                  key={u.id}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-[#faf9f6] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar size="default">
                      {u.image && <AvatarImage src={u.image} alt={u.name} />}
                      <AvatarFallback className="font-semibold text-primary">
                        {u.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {u.name}
                        </p>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : u.role === "vendor"
                                ? "bg-primary/10 text-primary"
                                : "bg-sky-100 text-sky-700"
                          }`}
                        >
                          {u.role}
                        </span>

                        {u.role === "vendor" && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              u.vendorApproved
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {u.vendorApproved ? "Approved Partner" : "Pending Approval"}
                          </span>
                        )}
                      </div>

                      <p className="truncate text-xs text-muted-foreground mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {/* Vendor Approval toggles */}
                    {u.role === "vendor" && (
                      u.vendorApproved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isWorking}
                          onClick={() => handleVendorApproval(u.id, false)}
                          className="h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                        >
                          Revoke Approval
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isWorking}
                          onClick={() => handleVendorApproval(u.id, true)}
                          className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Approve Vendor
                        </Button>
                      )
                    )}

                    {/* Role changer dropdown */}
                    <div className="flex items-center gap-1.5">
                      <select
                        disabled={isWorking || u.role === "admin"}
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(
                            u.id,
                            e.target.value as "customer" | "vendor" | "admin"
                          )
                        }
                        className="rounded-lg border border-[#e6dfd5] bg-white px-2.5 py-1 text-xs font-semibold text-foreground outline-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
