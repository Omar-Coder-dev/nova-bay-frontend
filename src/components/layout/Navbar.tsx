"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LogOut,
  Menu,
  Moon,
  Package,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  Sun,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/button";
import { Cart, Product } from "@/types";

/* ============================================================
   Navbar wrapper

   This component has only one hook and is responsible for
   deciding whether the navbar should exist.

   Keeping the admin check OUTSIDE the hook-heavy component
   prevents hook-count problems during route changes.
============================================================ */

export default function Navbar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <NavbarContent />;
}

/* ============================================================
   Actual Navbar
============================================================ */

function NavbarContent() {
  const pathname = usePathname();

  const { user, setUser } = useAuthStore();
  const { itemCount, setItemCount } = useCartStore();

  const {
    itemIds: wishlistIds,
    setItemIds: setWishlistIds,
  } = useWishlistStore();

  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* ==========================================================
     Restore authentication session
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const response = await api.get("/auth/me");

        if (!mounted) return;

        setUser(response.data);
      } catch {
        if (!mounted) return;

        setUser(null);
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [setUser]);

  /* ==========================================================
     Load cart + wishlist after authentication
  ========================================================== */

  useEffect(() => {
    if (!user) {
      setItemCount(0);
      setWishlistIds([]);
      return;
    }

    let mounted = true;

    const syncUserData = async () => {
      try {
        const [cartResponse, wishlistResponse] = await Promise.all([
          api.get<Cart>("/cart"),
          api.get<Product[]>("/users/wishlist"),
        ]);

        if (!mounted) return;

        const count = cartResponse.data.items.reduce(
          (total, item) => total + item.quantity,
          0
        );

        const wishlistProductIds = wishlistResponse.data.map(
          (product) => product._id
        );

        setItemCount(count);
        setWishlistIds(wishlistProductIds);
      } catch {
        if (!mounted) return;

        setItemCount(0);
        setWishlistIds([]);
      }
    };

    syncUserData();

    return () => {
      mounted = false;
    };
  }, [user, setItemCount, setWishlistIds]);

  /* ==========================================================
     Close mobile menu after navigation
  ========================================================== */

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  /* ==========================================================
     Theme
  ========================================================== */

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    const shouldBeDark =
      savedTheme === null || savedTheme === "dark";

    setIsDark(shouldBeDark);

    document.documentElement.classList.toggle(
      "dark",
      shouldBeDark
    );
  }, []);

  /* ==========================================================
     Prevent background scrolling when mobile menu is open
  ========================================================== */

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /* ==========================================================
     Escape closes mobile menu
  ========================================================== */

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  /* ==========================================================
     Theme toggle
  ========================================================== */

  const toggleTheme = useCallback(() => {
    setIsDark((previous) => {
      const next = !previous;

      document.documentElement.classList.toggle("dark", next);

      localStorage.setItem(
        "theme",
        next ? "dark" : "light"
      );

      return next;
    });
  }, []);

  /* ==========================================================
     Logout
  ========================================================== */

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Clear local state even if the API request fails.
    } finally {
      localStorage.removeItem("token"); // clears the header-fallback token too
      setUser(null);
      setItemCount(0);
      setWishlistIds([]);
      setIsMobileMenuOpen(false);

      toast.success("Logged out successfully");
    }
  }, [setUser, setItemCount, setWishlistIds]);

  /* ==========================================================
     Mobile menu
  ========================================================== */

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((previous) => !previous);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  /* ==========================================================
     Render
  ========================================================== */

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-5 lg:px-6">
        {/* =====================================================
            BRAND
        ====================================================== */}

        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-2 text-xl font-bold text-foreground"
        >
          <ShoppingBag className="h-6 w-6 text-blue-500" />
          <span>Nova Bay</span>
        </Link>

        {/* =====================================================
            DESKTOP
        ====================================================== */}

        <div className="hidden items-center gap-3 md:flex">
          {/* Theme */}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
            title={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Admin */}

          {user?.role === "admin" && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                <ShieldAlert className="mr-1.5 h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          )}

          {/* Orders */}

          {user && (
            <Link
              href="/orders"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Orders
            </Link>
          )}

          {/* Wishlist */}

          {user && (
            <Link
              href="/wishlist"
              className="relative"
              aria-label="Wishlist"
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Button>

              {wishlistIds.length > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                  {wishlistIds.length > 9
                    ? "9+"
                    : wishlistIds.length}
                </span>
              )}
            </Link>
          )}

          {/* Cart */}

          {user && (
            <Link
              href="/cart"
              className="relative"
              aria-label="Shopping cart"
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>

              {itemCount > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          )}

          {/* User */}

          {user ? (
            <div className="flex items-center gap-3 pl-2">
              <Link
                href="/profile"
                className="group flex min-w-0 items-center gap-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <span className="max-w-40 truncate text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  Hi, {user.name}
                </span>
              </Link>

              <Button
                size="sm"
                onClick={handleLogout}
                className="bg-red-600 text-white shadow-sm hover:bg-red-500"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>

              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-500"
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* =====================================================
            MOBILE HEADER
        ====================================================== */}

        <div className="flex items-center gap-1 md:hidden">
          {/* Theme */}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Cart */}

          {user && (
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />

              {itemCount > 0 && (
                <span className="pointer-events-none absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          )}

          {/* Menu */}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* =======================================================
          MOBILE MENU
      ======================================================== */}

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-border bg-background md:hidden ${
          isMobileMenuOpen
            ? "max-h-[calc(100vh-4rem)] opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        } transition-[max-height,opacity] duration-200 ease-out`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="overflow-y-auto px-4 pb-6 pt-3">
          {user ? (
            <div className="flex flex-col gap-2">
              {/* User info */}

              <div className="mb-2 flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Admin */}

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-amber-500 transition-colors hover:bg-accent"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  Admin Panel
                </Link>
              )}

              {/* Orders */}

              <Link
                href="/orders"
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                My Orders
              </Link>

              {/* Profile */}

              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                My Account
              </Link>

              {/* Wishlist */}

              <Link
                href="/wishlist"
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 shrink-0 text-muted-foreground" />
                  Wishlist
                </div>

                {wishlistIds.length > 0 && (
                  <span className="rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-semibold text-red-500">
                    {wishlistIds.length}{" "}
                    {wishlistIds.length === 1
                      ? "item"
                      : "items"}
                  </span>
                )}
              </Link>

              {/* Cart */}

              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4 shrink-0 text-muted-foreground" />
                  Shopping Cart
                </div>

                {itemCount > 0 && (
                  <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-semibold text-blue-500">
                    {itemCount}{" "}
                    {itemCount === 1 ? "item" : "items"}
                  </span>
                )}
              </Link>

              {/* Logout */}

              <Button
                onClick={handleLogout}
                className="mt-2 min-h-11 w-full justify-center bg-red-600 text-white hover:bg-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Button
                asChild
                variant="outline"
                className="min-h-11 w-full"
              >
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
              </Button>

              <Button
                asChild
                className="min-h-11 w-full bg-blue-600 hover:bg-blue-500"
              >
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}