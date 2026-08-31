"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/api";
import { Product, Cart } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

import { Button } from "@/components/ui/button";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  PackageX,
  Loader2,
  ChevronLeft,
  Heart,
} from "lucide-react";
import ReviewSection from "@/components/ReviewSection";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const setItemCount = useCartStore((state) => state.setItemCount);
  const { itemIds: wishlistIds, addId, removeId } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const [productRes, relatedRes] = await Promise.all([
          api.get<Product>(`/products/${productId}`),
          api.get<Product[]>(`/products/${productId}/related`),
        ]);

        setProduct(productRes.data);
        setRelatedProducts(relatedRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    setQuantity((prev) => Math.min(Math.max(1, prev + delta), product.stock));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);

    try {
      await api.post("/cart", { productId: product._id, quantity });
      toast.success(`Added ${quantity} × ${product.name} to cart`);

      const cartRes = await api.get<Cart>("/cart");
      const count = cartRes.data.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please sign in to add items to your cart");
        router.push("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to add to cart.");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    const isWishlisted = wishlistIds.includes(product._id);

    setTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await api.delete(`/users/wishlist/${product._id}`);
        removeId(product._id);
        toast.success("Removed from wishlist");
      } else {
        await api.post(`/users/wishlist/${product._id}`);
        addId(product._id);
        toast.success("Added to wishlist");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please sign in to save items");
        router.push("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to update wishlist.");
      }
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
        <p className="text-lg font-medium text-muted-foreground">{error || "Product not found."}</p>
        <Link href="/products">
          <Button className="bg-blue-600 hover:bg-blue-500">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isWishlisted = wishlistIds.includes(product._id);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <span className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-red-500">
                  <PackageX className="h-4 w-4" />
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="mb-2 w-fit rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-500">
              {product.category.replace(/_/g, " ")}
            </span>

            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>

            {product.numReviews > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">{product.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({product.numReviews} reviews)</span>
              </div>
            )}

            <p className="mt-4 text-3xl font-bold text-blue-500">
              ${product.price.toFixed(2)}
            </p>

            <p className="mt-4 leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <p className="mt-4 text-sm font-medium">
              {isOutOfStock ? (
                <span className="text-red-500">Out of stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-yellow-500">Only {product.stock} left in stock</span>
              ) : (
                <span className="text-green-500">{product.stock} in stock</span>
              )}
            </p>

            {!isOutOfStock && (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-3 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold shadow-lg shadow-blue-600/30 transition-all"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  variant="outline"
                  className="h-12 w-12 shrink-0 border-border p-0"
                  aria-label="Toggle wishlist"
                >
                  {togglingWishlist ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Heart
                      className={`h-5 w-5 ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
                      }`}
                    />
                  )}
                </Button>
              </div>
            )}

            {isOutOfStock && (
              <div className="mt-6">
                <Button
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  variant="outline"
                  className="h-12 w-full border-border"
                >
                  {togglingWishlist ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Heart
                      className={`mr-2 h-5 w-5 ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
                      }`}
                    />
                  )}
                  {isWishlisted ? "Remove from Wishlist" : "Save for Later"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-4 text-2xl font-bold text-foreground">You might also like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          </div>
        )}
        <ReviewSection productId={productId} />
      </div>
    </div>
  );
}