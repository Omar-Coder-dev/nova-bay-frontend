"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  AlertTriangle,
  Loader2,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/low-stock", label: "Low Stock", icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checking && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [checking, user, router]);

  // Close the mobile sidebar automatically on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  if (checking || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sticky Header Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-bold uppercase tracking-wider text-foreground">
            Admin Panel
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"
          aria-label="Toggle admin navigation menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        {/* Navigation Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-card p-6 transition-transform duration-200 ease-in-out lg:static lg:z-0 lg:w-60 lg:transform-none lg:border-0 lg:bg-transparent lg:p-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-6">
              {/* Sidebar Header / Logo */}
              <div className="flex items-center justify-between lg:block">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-blue-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Admin Portal
                  </h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-500/10 text-blue-500 font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Back to Storefront Link */}
            <div className="border-t border-border pt-4">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Return to Storefront
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}