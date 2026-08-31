"use client";

import { memo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/api";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

import {
  Heart,
  ShoppingCart,
  Star,
  PackageX,
  Loader2,
  Tag,
  ImageOff,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

function ProductCard({
  product,
  priority = false,
}: ProductCardProps) {
  const router = useRouter();

  const setItemCount = useCartStore(
    (state) => state.setItemCount
  );

  const wishlistIds = useWishlistStore(
    (state) => state.itemIds
  );

  const addId = useWishlistStore(
    (state) => state.addId
  );

  const removeId = useWishlistStore(
    (state) => state.removeId
  );

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] =
    useState(false);

  const isOutOfStock = product.stock === 0;
  const isWishlisted = wishlistIds.includes(product._id);

  const formattedCategory = product.category
    ? product.category
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

  const handleAddToCart = async (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || addingToCart) return;

    setAddingToCart(true);

    try {
      await api.post("/cart", {
        productId: product._id,
        quantity: 1,
      });

      const cartRes = await api.get("/cart");

      const count = cartRes.data.items.reduce(
        (
          sum: number,
          item: { quantity: number }
        ) => sum + item.quantity,
        0
      );

      setItemCount(count);

      toast.success(
        `Added ${product.name} to cart`
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error(
          "Please sign in to add items to your cart"
        );

        router.push("/login");
      } else {
        toast.error(
          err.response?.data?.message ||
            "Failed to add to cart."
        );
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (togglingWishlist) return;

    const currentlyWishlisted = isWishlisted;

    // Optimistic update
    if (currentlyWishlisted) {
      removeId(product._id);
    } else {
      addId(product._id);
    }

    setTogglingWishlist(true);

    try {
      if (currentlyWishlisted) {
        await api.delete(
          `/users/wishlist/${product._id}`
        );

        toast.success(
          "Removed from wishlist"
        );
      } else {
        await api.post(
          `/users/wishlist/${product._id}`
        );

        toast.success(
          "Added to wishlist"
        );
      }
    } catch (err: any) {
      // Revert optimistic update
      if (currentlyWishlisted) {
        addId(product._id);
      } else {
        removeId(product._id);
      }

      if (err.response?.status === 401) {
        toast.error(
          "Please sign in to save items"
        );

        router.push("/login");
      } else {
        toast.error(
          err.response?.data?.message ||
            "Failed to update wishlist."
        );
      }
    } finally {
      setTogglingWishlist(false);
    }
  };

  return (
    <Link
      href={`/products/${product._id}`}
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        transition-[border-color,box-shadow]
        duration-200
        hover:border-blue-500/50
        hover:shadow-lg
        hover:shadow-blue-500/10
      "
    >
      {/* IMAGE */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* Image placeholder */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-muted" />
        )}

        {/* Image error */}
        {imgError ? (
          <div
            className="
              flex
              h-full
              w-full
              flex-col
              items-center
              justify-center
              gap-1
              bg-muted
              text-muted-foreground
            "
          >
            <ImageOff className="h-8 w-8" />

            <span className="text-xs">
              No image
            </span>
          </div>
        ) : (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="
              (max-width: 640px) 50vw,
              (max-width: 1024px) 33vw,
              20vw
            "
            className={`
              pointer-events-none
              object-cover
              transition-opacity
              duration-150
              ${
                imgLoaded
                  ? "opacity-100"
                  : "opacity-0"
              }
              group-hover:scale-105
            `}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* WISHLIST */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={togglingWishlist}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className="
            absolute
            right-2
            top-2
            z-10
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-background/80
            shadow-sm
            backdrop-blur-sm
            transition-transform
            duration-150
            hover:scale-105
            active:scale-95
            disabled:opacity-50
          "
        >
          {togglingWishlist ? (
            <Loader2
              className="
                h-4
                w-4
                animate-spin
                text-muted-foreground
              "
            />
          ) : (
            <Heart
              className={`
                h-4
                w-4
                ${
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }
              `}
            />
          )}
        </button>

        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div
            className="
              absolute
              inset-0
              z-10
              flex
              items-center
              justify-center
              bg-background/70
            "
          >
            <span
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                border
                border-red-500/20
                bg-card
                px-3
                py-1.5
                text-xs
                font-semibold
                text-red-500
                shadow-sm
              "
            >
              <PackageX className="h-3.5 w-3.5" />
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-1.5">
          {/* CATEGORY */}
          {formattedCategory && (
            <div
              className="
                flex
                items-center
                gap-1
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-blue-500
              "
            >
              <Tag className="h-3 w-3 shrink-0" />

              <span className="truncate">
                {formattedCategory}
              </span>
            </div>
          )}

          {/* NAME */}
          <h3
            className="
              line-clamp-2
              text-sm
              font-semibold
              text-foreground
              transition-colors
              group-hover:text-blue-500
              sm:text-base
            "
          >
            {product.name}
          </h3>

          {/* RATING */}
          {product.numReviews > 0 && (
            <div
              className="
                flex
                items-center
                gap-1
                text-xs
                text-muted-foreground
              "
            >
              <Star
                className="
                  h-3.5
                  w-3.5
                  fill-yellow-400
                  text-yellow-400
                "
              />

              <span className="font-medium text-foreground">
                {product.averageRating.toFixed(1)}
              </span>

              <span>
                ({product.numReviews})
              </span>
            </div>
          )}
        </div>

        {/* PRICE + CART */}
        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            border-t
            border-border/50
            pt-2
          "
        >
          <span className="text-lg font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              addingToCart || isOutOfStock
            }
            aria-label="Add to cart"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-blue-600
              text-white
              transition-transform
              duration-150
              hover:bg-blue-500
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {addingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);