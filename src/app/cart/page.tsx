"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/api";
import { Cart } from "@/types";
import { useCartStore } from "@/store/cartStore";

import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

export default function CartPage() {
  const setItemCount = useCartStore((state) => state.setItemCount);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  const syncCount = (updatedCart: Cart) => {
    const count = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
    setItemCount(count);
  };

  const fetchCart = async () => {
    try {
      const response = await api.get<Cart>("/cart");
      setCart(response.data);
      syncCount(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please log in to view your cart.");
      } else {
        toast.error("Failed to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateQuantity = async (productId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;

    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} in stock.`);
      return;
    }

    setUpdatingProductId(productId);

    try {
      const response = await api.patch<Cart>(`/cart/${productId}`, {
        quantity: newQuantity,
      });
      setCart(response.data);
      syncCount(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update quantity.");
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    setUpdatingProductId(productId);

    try {
      const response = await api.delete<Cart>(`/cart/${productId}`);
      setCart(response.data);
      syncCount(response.data);
      toast.success(`Removed ${productName} from cart.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove item.");
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await api.delete<Cart>("/cart");
      setCart(response.data);
      syncCount(response.data);
      toast.success("Cart cleared.");
    } catch {
      toast.error("Failed to clear cart.");
    }
  };

  const subtotal =
    cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold text-foreground sm:mb-6 sm:text-3xl">
          Your Cart
        </h1>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-16 text-center sm:py-24">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-base font-medium text-muted-foreground sm:text-lg">
              Your cart is empty.
            </p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-500">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex justify-end">
                <button
                  onClick={handleClearCart}
                  className="text-xs font-medium text-muted-foreground hover:text-red-500 sm:text-sm"
                >
                  Clear cart
                </button>
              </div>

              {cart.items.map((item) => {
                const isUpdating = updatingProductId === item.product._id;

                return (
                  <div
                    key={item.product._id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 sm:flex-row sm:gap-4 sm:p-4"
                  >
                    <div className="flex items-center gap-3 sm:items-start">
                      <Link
                        href={`/products/${item.product._id}`}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24"
                      >
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 80px, 96px"
                        />
                      </Link>

                      <div className="flex flex-1 flex-col sm:hidden">
                        <Link
                          href={`/products/${item.product._id}`}
                          className="line-clamp-2 text-sm font-semibold text-foreground hover:text-blue-500"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs font-medium text-blue-500">
                          ${item.product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-3">
                      <div className="hidden items-start justify-between gap-2 sm:flex">
                        <div>
                          <Link
                            href={`/products/${item.product._id}`}
                            className="font-semibold text-foreground hover:text-blue-500"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm font-medium text-blue-500">
                            ${item.product.price.toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.product._id, item.product.name)}
                          disabled={isUpdating}
                          className="p-1 text-muted-foreground hover:text-red-500 disabled:opacity-40"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-2 sm:border-t-0 sm:pt-0">
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.product._id, item.quantity - 1, item.product.stock)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            className="p-2 text-muted-foreground hover:text-foreground active:bg-muted disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-foreground">
                            {isUpdating ? (
                              <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.product._id, item.quantity + 1, item.product.stock)
                            }
                            disabled={isUpdating || item.quantity >= item.product.stock}
                            className="p-2 text-muted-foreground hover:text-foreground active:bg-muted disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-foreground sm:text-base">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>

                          <button
                            onClick={() => handleRemoveItem(item.product._id, item.product.name)}
                            disabled={isUpdating}
                            className="p-1 text-muted-foreground hover:text-red-500 sm:hidden disabled:opacity-40"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-fit rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-bold text-foreground sm:text-lg">
                Order Summary
              </h2>

              <div className="space-y-2 border-b border-border pb-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-base font-bold text-foreground sm:text-lg">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button className="h-11 w-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 sm:h-12 sm:text-base">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}