"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/api";
import { Product } from "@/types";
import { useWishlistStore } from "@/store/wishlistStore";

import { Button } from "@/components/ui/button";
import { Heart, Loader2, ShoppingCart, Trash2, Star, Sparkles, PackageX } from "lucide-react";

export default function WishlistPage() {
  const setItemIds = useWishlistStore((state) => state.setItemIds);
  const removeId = useWishlistStore((state) => state.removeId);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      const response = await api.get<Product[]>("/users/wishlist");
      setProducts(response.data);
      setItemIds(response.data.map((p) => p._id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please log in to view your wishlist.");
      } else {
        toast.error("Failed to load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (productId: string, productName: string) => {
    setProcessingId(productId);
    try {
      await api.delete(`/users/wishlist/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      removeId(productId);
      toast.success(`Removed ${productName} from wishlist`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove item.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    setProcessingId(productId);
    try {
      await api.post("/cart", { productId, quantity: 1 });
      toast.success(`Added ${productName} to cart`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add to cart.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 space-y-2 border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-sm font-semibold tracking-wide text-red-500">
            <Sparkles className="h-4 w-4" />
            <span>SAVED FOR LATER</span>
          </div>
          <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-foreground">
            <Heart className="h-9 w-9 fill-red-500 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-base text-muted-foreground">
            {products.length > 0
              ? `${products.length} item${products.length > 1 ? "s" : ""} saved`
              : "Nothing saved yet"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Heart className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Your wishlist is empty</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Tap the heart icon on any product to save it here for later.
              </p>
            </div>
            <Link href="/products">
              <Button className="mt-2 bg-blue-600 hover:bg-blue-500">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const isProcessing = processingId === product._id;
              const isOutOfStock = product.stock === 0;

              return (
                <div
                  key={product._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <Link
                    href={`/products/${product._id}`}
                    className="relative aspect-4/3 w-full overflow-hidden bg-muted"
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-red-500">
                          <PackageX className="h-3.5 w-3.5" />
                          Out of Stock
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(product._id, product.name);
                      }}
                      disabled={isProcessing}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-red-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-card disabled:opacity-40"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Link>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <Link
                      href={`/products/${product._id}`}
                      className="line-clamp-1 font-semibold text-foreground hover:text-blue-500"
                    >
                      {product.name}
                    </Link>

                    {product.numReviews > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">
                          {product.averageRating.toFixed(1)}
                        </span>
                        <span>({product.numReviews})</span>
                      </div>
                    )}

                    <p className="text-lg font-bold text-blue-500">
                      ${product.price.toFixed(2)}
                    </p>

                    <Button
                      size="sm"
                      disabled={isProcessing || isOutOfStock}
                      onClick={() => handleAddToCart(product._id, product.name)}
                      className="mt-auto h-9 w-full bg-blue-600 text-sm font-semibold hover:bg-blue-500"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </>
                      )}
                    </Button>
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