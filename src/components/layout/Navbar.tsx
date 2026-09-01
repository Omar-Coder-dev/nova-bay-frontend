"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  LogOut,
  Sun,
  Moon,
  ShoppingCart,
  Heart,
  Menu,
  X,
  User as UserIcon,
  Package,
} from "lucide-react";
import { Cart, Product } from "@/types";

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const { itemCount, setItemCount } = useCartStore();
  const { itemIds: wishlistIds, setItemIds: setWishlistIds } =
    useWishlistStore();
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch {
        setUser(null);
      }
    };
    restoreSession();
  }, [setUser]);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setItemCount(0);
        return;
      }
      try {
        const response = await api.get<Cart>("/cart");
        const count = response.data.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        setItemCount(count);
      } catch {
        setItemCount(0);
      }
    };
    fetchCartCount();
  }, [user, setItemCount]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlistIds([]);
        return;
      }
      try {
        const response = await api.get<Product[]>("/users/wishlist");
        setWishlistIds(response.data.map((p) => p._id));
      } catch {
        setWishlistIds([]);
      }
    };
    fetchWishlist();
  }, [user, setWishlistIds]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const shouldBeDark = savedTheme ? savedTheme === "dark" : true;

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      // Clear the fallback token too - without this, a stale token would
      // still get attached as a header on future requests even after
      // "logging out", since the interceptor reads straight from localStorage.
      localStorage.removeItem("token");
      setUser(null);
      setItemCount(0);
      setWishlistIds([]);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-foreground"
        >
          <ShoppingBag className="h-6 w-6 text-blue-500" />
          Nova Bay
        </Link>

        {/* Desktop nav - hidden on small screens */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Products
          </Link>

          {user && (
            <Link
              href="/orders"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Orders
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user && (
            <Link href="/wishlist" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Heart className="h-5 w-5" />
              </Button>
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                </span>
              )}
            </Link>
          )}

          {user && (
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Hi, {user.name}
                </span>
              </Link>
              <Button
                size="sm"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile controls - visible only below md breakpoint */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user && (
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="text-muted-foreground"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          {user ? (
            <div className="p-4">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 border-b border-border pb-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </Link>

              <div className="space-y-1 py-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  My Account
                </Link>
                {/* NEW - was missing entirely from the mobile menu before */}
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Package className="h-5 w-5 text-muted-foreground" />
                  My Orders
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  Wishlist
                  {wishlistIds.length > 0 && (
                    <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      {wishlistIds.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  Shopping Cart
                  {itemCount > 0 && (
                    <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>

              <Button
                onClick={handleLogout}
                className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Browse Products
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-500">
                  <span>Sign Up</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}