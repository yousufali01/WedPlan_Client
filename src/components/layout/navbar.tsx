"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";
import { cn } from "cn";

const navLinks = [
  { href: "/#home", label: "Home", section: "home" },
  { href: "/#services", label: "Services", section: "services" },
  { href: "/#categories", label: "Categories", section: "categories" },
  { href: "/#about", label: "About", section: "about" },
  {
    href: "/#how-it-works",
    label: "How It Works",
    section: "how-it-works",
  },
  {
    href: "/#testimonials",
    label: "Testimonials",
    section: "testimonials",
  },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function UserAvatar({ size = "sm" }: { size?: "sm" | "default" }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Avatar size={size}>
        <AvatarFallback>
          <span className="sr-only">No user</span>
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar size={size}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
      <AvatarFallback>
        {getInitials(user.name) || <span className="sr-only">{user.name}</span>}
      </AvatarFallback>
    </Avatar>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, signOut, role } = useAuth();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("home");

  const dashboardHref =
    role === "admin"
      ? siteConfig.dashboards.admin
      : role === "vendor"
        ? siteConfig.dashboards.vendor
        : siteConfig.dashboards.customer;

  // Detect the currently visible homepage section.
  React.useEffect(() => {
    if (pathname !== "/") return;

    const sections = navLinks
      .map((link) => document.getElementById(link.section))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);

  // Logout with toast notification.
  const handleSignOut = async () => {
    setMobileOpen(false);

    try {
      await signOut();
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Handle navigation click.
  const handleNavClick = (section: string) => {
    setMobileOpen(false);

    setActiveSection(section);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-345 items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        {/* Logo: Navigate to Hero Section */}
        <Link
          href="/#home"
          aria-label="Go to homepage"
          className="shrink-0"
          onClick={() => {
            setActiveSection("home");
            setMobileOpen(false);
          }}
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 xl:flex"
        >
          {navLinks.map((link) => {
            const isActive = pathname === "/" && activeSection === link.section;

            return (
              <Link
                key={link.section}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleNavClick(link.section)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="gap-2 pl-1 pr-2"
                    aria-label="Open user menu"
                  />
                }
              >
                <UserAvatar />

                <span className="max-w-32 truncate text-sm font-medium">
                  {user.name}
                </span>

                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60">
                <div className="flex items-center gap-2.5 px-1.5 py-1.5">
                  <UserAvatar size="default" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {user.name}
                      </p>

                      {user.role && (
                        <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {user.role}
                        </span>
                      )}
                    </div>

                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push(dashboardHref)}>
                  <LayoutDashboard aria-hidden="true" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push(siteConfig.routes.profile)}
                >
                  <Settings aria-hidden="true" />
                  Profile Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut aria-hidden="true" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                render={<Link href={siteConfig.routes.signIn} />}
              >
                Sign In
              </Button>

              <Button render={<Link href={siteConfig.routes.signUp} />}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>

          <SheetContent side="right" className="w-80 max-w-[85vw]">
            <SheetHeader className="pb-2">
              <SheetTitle className="font-heading text-lg font-semibold tracking-tight">
                {siteConfig.name}
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Navigation Links */}
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1 px-4"
            >
              {navLinks.map((link) => {
                const isActive =
                  pathname === "/" && activeSection === link.section;

                return (
                  <Link
                    key={link.section}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => handleNavClick(link.section)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Authentication */}
            <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2.5 pb-2">
                    <UserAvatar size="default" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>

                        {user.role && (
                          <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                            {user.role}
                          </span>
                        )}
                      </div>

                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    render={
                      <Link
                        href={dashboardHref}
                        onClick={() => setMobileOpen(false)}
                        className="w-full"
                      />
                    }
                  >
                    <LayoutDashboard className="mr-2 size-4" />
                    Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    render={
                      <Link
                        href={siteConfig.routes.profile}
                        onClick={() => setMobileOpen(false)}
                        className="w-full"
                      />
                    }
                  >
                    <Settings className="mr-2 size-4" />
                    Profile Settings
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    render={
                      <Link
                        href={siteConfig.routes.signIn}
                        onClick={() => setMobileOpen(false)}
                        className="w-full"
                      />
                    }
                  >
                    Sign In
                  </Button>

                  <Button
                    render={
                      <Link
                        href={siteConfig.routes.signUp}
                        onClick={() => setMobileOpen(false)}
                        className="w-full"
                      />
                    }
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
