"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  Store,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { siteConfig } from "@/config/site";

type Booking = {
  _id: string;
  serviceId: string;
  serviceName?: string;
  customerName?: string;
  customerEmail?: string;
  eventDate?: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  price?: number;
  createdAt?: string;
};

type ServiceItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  availability: boolean;
};

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const fetchVendorData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.allSettled([
        apiRequest<{ bookings: Booking[] }>("/api/v1/bookings"),
        apiRequest<{ services: ServiceItem[] }>("/api/v1/services"),
      ]);

      if (bookingsRes.status === "fulfilled" && bookingsRes.value.bookings) {
        setBookings(bookingsRes.value.bookings);
      }
      if (servicesRes.status === "fulfilled" && servicesRes.value.services) {
        setServices(servicesRes.value.services);
      }
    } catch (err) {
      console.error("Vendor data load note:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void fetchVendorData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchVendorData]);

  const handleBookingStatus = async (
    bookingId: string,
    status: "accepted" | "rejected"
  ) => {
    setUpdatingId(bookingId);
    try {
      await apiRequest(`/api/v1/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      toast.success(
        status === "accepted" ? "Booking accepted!" : "Booking declined."
      );

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
    } catch (err) {
      toast.error("Failed to update booking status", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const isApproved = user?.vendorApproved === true;

  return (
    <ProtectedRoute allowedRoles={["vendor", "admin"]}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Store className="size-3.5" aria-hidden="true" />
                Vendor Portal
              </span>
              {isApproved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Approved Partner
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  <Clock className="size-3" aria-hidden="true" />
                  Pending Approval
                </span>
              )}
            </div>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome, {user?.name || "Vendor"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your listed wedding services, track client inquiries, and confirm bookings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVendorData}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </Button>
            <Button
              size="sm"
              render={<Link href={siteConfig.routes.services} />}
              className="gap-1.5"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Browse Services
            </Button>
          </div>
        </div>

        {/* Approval Alert if Unapproved */}
        {!isApproved && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Application Under Admin Review</p>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                Your vendor account is currently being reviewed by our administration team. Once
                approved, your services will be published to couples and you will be able to receive
                live bookings.
              </p>
            </div>
          </div>
        )}

        {/* Metrics Row */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">My Listings</span>
              <Store className="size-4 text-primary" aria-hidden="true" />
            </div>
            <p className="font-heading text-3xl font-semibold">{services.length}</p>
            <p className="text-xs text-muted-foreground">Packages & Services</p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Bookings Received</span>
              <CalendarCheck className="size-4 text-primary" aria-hidden="true" />
            </div>
            <p className="font-heading text-3xl font-semibold">{bookings.length}</p>
            <p className="text-xs text-muted-foreground">Client reservations</p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Partner Status</span>
              <span
                className={`size-2 rounded-full ${isApproved ? "bg-emerald-500" : "bg-amber-500"}`}
              />
            </div>
            <p
              className={`font-heading text-2xl font-semibold ${isApproved ? "text-emerald-600" : "text-amber-600"}`}
            >
              {isApproved ? "Active" : "In Review"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isApproved ? "Public catalog visible" : "Pending administrator approval"}
            </p>
          </div>
        </div>

        {/* Bookings Section */}
        <section className="mt-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold tracking-tight">Recent Bookings</h2>
              <p className="text-xs text-muted-foreground">
                Inquiries and reservation requests from couples planning their wedding.
              </p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
              {bookings.length} Total
            </span>
          </div>

          {isLoading ? (
            <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-border bg-card">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <CalendarCheck className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium text-foreground">No booking requests yet</p>
              <p className="text-xs text-muted-foreground">
                Once couples discover your profile and book your packages, reservations will appear
                here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {booking.serviceName || "Wedding Service"}
                      </p>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          booking.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : booking.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Client: {booking.customerName || "Couple"} &bull;{" "}
                      {booking.eventDate
                        ? `Event: ${new Date(booking.eventDate).toLocaleDateString()}`
                        : "Date to be confirmed"}
                    </p>
                  </div>

                  {booking.status === "pending" && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingId === booking._id}
                        onClick={() => handleBookingStatus(booking._id, "rejected")}
                        className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <XCircle className="size-3.5" aria-hidden="true" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        disabled={updatingId === booking._id}
                        onClick={() => handleBookingStatus(booking._id, "accepted")}
                        className="gap-1"
                      >
                        {updatingId === booking._id ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        )}
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
