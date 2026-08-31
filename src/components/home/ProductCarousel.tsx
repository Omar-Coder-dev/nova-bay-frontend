"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  PackageX,
  Star,
} from "lucide-react";

export function ProductCarousel({
  products,
}: {
  products: Product[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === "left"
        ? -el.clientWidth * 0.85
        : el.clientWidth * 0.85,
      behavior: "smooth",
    });
  }, []);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    // Only use custom dragging for mouse.
    // Phones/tablets should use native touch scrolling.
    if (e.pointerType !== "mouse") return;

    const el = scrollRef.current;
    if (!el) return;

    setIsDragging(true);
    hasMoved.current = false;

    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;

    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging || e.pointerType !== "mouse") return;

    const el = scrollRef.current;
    if (!el) return;

    const distance = e.clientX - startX.current;

    if (Math.abs(distance) > 6) {
      hasMoved.current = true;
    }

    if (hasMoved.current) {
      el.scrollLeft = startScrollLeft.current - distance;
    }
  };

  const stopDragging = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.pointerType !== "mouse") return;

    const el = scrollRef.current;

    setIsDragging(false);

    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }

    // Allow the click event to happen normally if
    // the user didn't actually drag.
    requestAnimationFrame(() => {
      hasMoved.current = false;
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        className={`flex gap-3 overflow-x-auto overscroll-x-contain pb-2
          scrollbar:none
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
          ${
            isDragging
              ? "cursor-grabbing select-none"
              : "cursor-grab"
          }
        `}
        style={{
          touchAction: "pan-x",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            draggable={false}
            onClick={(e) => {
              if (hasMoved.current) {
                e.preventDefault();
                hasMoved.current = false;
              }
            }}
            className="
              group
              w-[44%]
              shrink-0
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-card
              transition-colors
              hover:border-blue-500/50
              sm:w-[30%]
              lg:w-[18.5%]
              xl:w-[15.5%]
            "
          >
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                loading="lazy"
                sizes="
                  (max-width: 640px) 44vw,
                  (max-width: 1024px) 30vw,
                  16vw
                "
                className="
                  pointer-events-none
                  object-cover
                  transition-transform
                  duration-200
                  group-hover:scale-105
                "
              />

              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-red-500">
                    <PackageX className="h-3.5 w-3.5" />
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-blue-500">
                {product.name}
              </h3>

              {product.numReviews > 0 && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />

                  <span className="font-medium text-foreground">
                    {product.averageRating.toFixed(1)}
                  </span>

                  <span>
                    ({product.numReviews})
                  </span>
                </div>
              )}

              <p className="mt-1.5 text-base font-bold text-blue-500">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop arrows */}
      <button
        type="button"
        aria-label="Scroll products left"
        onClick={() => scroll("left")}
        className="
          absolute
          -left-4
          top-1/2
          hidden
          h-10
          w-10
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-card
          shadow-lg
          transition-colors
          hover:bg-muted
          sm:flex
        "
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>

      <button
        type="button"
        aria-label="Scroll products right"
        onClick={() => scroll("right")}
        className="
          absolute
          -right-4
          top-1/2
          hidden
          h-10
          w-10
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-card
          shadow-lg
          transition-colors
          hover:bg-muted
          sm:flex
        "
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>
    </div>
  );
}