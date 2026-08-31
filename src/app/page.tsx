"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import { Product, ProductsResponse } from "@/types";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";

import {
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Zap,
  Tag,
} from "lucide-react";

const CATEGORIES = [
  {
    value: "electronics",
    label: "Electronics",
    emoji: "🎧",
  },
  {
    value: "clothing",
    label: "Clothing",
    emoji: "👕",
  },
  {
    value: "home_and_kitchen",
    label: "Home & Kitchen",
    emoji: "🏠",
  },
  {
    value: "beauty",
    label: "Beauty",
    emoji: "💄",
  },
  {
    value: "sports",
    label: "Sports",
    emoji: "🏋️",
  },
  {
    value: "books",
    label: "Books",
    emoji: "📚",
  },
];

function ProductSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-2
        gap-3
        sm:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
      "
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-card
            "
        >
          <div
            className="
                aspect-square
                animate-pulse
                bg-muted
              "
          />

          <div className="space-y-3 p-4">
            <div
              className="
                  h-3
                  w-1/3
                  animate-pulse
                  rounded
                  bg-muted
                "
            />

            <div
              className="
                  h-4
                  w-4/5
                  animate-pulse
                  rounded
                  bg-muted
                "
            />

            <div
              className="
                  h-5
                  w-1/3
                  animate-pulse
                  rounded
                  bg-muted
                "
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["home-products"],

    queryFn: async () => {
      const response = await api.get<ProductsResponse>("/products", {
        params: {
          limit: 10,
        },
      });

      return response.data.products;
    },

    staleTime: 5 * 60 * 1000,

    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    retry: 1,
  });

  return (
    <main className="min-h-screen bg-background">
      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section
        className="
          border-b
          border-border
          bg-linear-to-br
          from-blue-600
          via-indigo-600
          to-purple-600
        "
      >
        <div
          className="
            mx-auto
            max-w-[1600px]
            px-4
            py-16
            sm:px-6
            sm:py-20
            lg:px-8
          "
        >
          <div className="max-w-3xl">
            <div
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-white/15
                px-4
                py-2
                text-sm
                font-semibold
                text-white
              "
            >
              <Zap className="h-4 w-4" />
              New arrivals every week
            </div>

            <h1
              className="
                text-4xl
                font-black
                tracking-tight
                text-white
                sm:text-5xl
                lg:text-6xl
              "
            >
              Shop smarter with Nova Bay
            </h1>

            <p
              className="
                mt-5
                max-w-2xl
                text-base
                leading-7
                text-white/85
                sm:text-lg
              "
            >
              Quality products, honest prices, and a simple shopping experience.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <Button
                asChild
                className="
                  h-12
                  bg-white
                  px-7
                  font-semibold
                  text-slate-900
                  hover:bg-white/90
                "
              >
                <Link href="/products">
                  Shop All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="
                  h-12
                  border-white/30
                  bg-white/10
                  px-7
                  font-semibold
                  text-white
                  hover:bg-white/20
                  hover:text-white
                "
              >
                <Link href="/products?category=electronics">
                  Browse Electronics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* CATEGORIES */}
      {/* ================================================= */}

      <section
        className="
          border-b
          border-border
          bg-card/50
        "
      >
        <div
          className="
            mx-auto
            max-w-[1600px]
            px-4
            py-8
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              mb-5
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <h2
              className="
                text-xl
                font-bold
                text-foreground
                sm:text-2xl
              "
            >
              Shop by Category
            </h2>

            <Link
              href="/products"
              className="
                flex
                shrink-0
                items-center
                gap-1
                text-sm
                font-semibold
                text-blue-500
                transition-colors
                hover:text-blue-400
              "
            >
              All products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              lg:grid-cols-6
            "
          >
            {CATEGORIES.map((category) => (
              <Link
                key={category.value}
                href={`/products?category=${category.value}`}
                className="
                    flex
                    min-h-26.5
                    flex-col
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-border
                    bg-card
                    p-3
                    text-center
                    transition-[border-color,box-shadow,transform]
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-blue-500/50
                    hover:shadow-md
                    active:translate-y-0
                  "
              >
                <span
                  aria-hidden="true"
                  className="
                      text-3xl
                      leading-none
                    "
                >
                  {category.emoji}
                </span>

                <span
                  className="
                      text-xs
                      font-semibold
                      text-foreground
                      sm:text-sm
                    "
                >
                  {category.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* FEATURED PRODUCTS */}
      {/* ================================================= */}

      <section
        className="
          mx-auto
          max-w-[1600px]
          px-4
          py-10
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            mb-6
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <Tag
                className="
                  h-5
                  w-5
                  text-blue-500
                "
              />

              <h2
                className="
                  text-2xl
                  font-bold
                  text-foreground
                "
              >
                Featured Products
              </h2>
            </div>

            <p
              className="
                mt-1
                text-sm
                text-muted-foreground
              "
            >
              Check out some of our latest products.
            </p>
          </div>

          <Link
            href="/products"
            className="
              flex
              shrink-0
              items-center
              gap-1
              text-sm
              font-semibold
              text-blue-500
              transition-colors
              hover:text-blue-400
            "
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* LOADING */}
        {isLoading && <ProductSkeleton />}

        {/* ERROR */}
        {isError && (
          <div
            className="
              rounded-2xl
              border
              border-border
              bg-card
              px-6
              py-12
              text-center
            "
          >
            <p
              className="
                font-semibold
                text-foreground
              "
            >
              Could not load products.
            </p>

            <p
              className="
                mt-1
                text-sm
                text-muted-foreground
              "
            >
              Please try again later.
            </p>

            <Button
              asChild
              className="
                mt-5
                bg-blue-600
                hover:bg-blue-500
              "
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        )}

        {/* PRODUCTS */}
        {!isLoading && !isError && products && products.length > 0 && (
          <div
            className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                sm:gap-4
                lg:grid-cols-4
                xl:grid-cols-5
              "
          >
            {products.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                priority={index < 5}
              />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!isLoading && !isError && (!products || products.length === 0) && (
          <div
            className="
                rounded-2xl
                border
                border-border
                bg-card
                px-6
                py-12
                text-center
              "
          >
            <p
              className="
                  text-sm
                  text-muted-foreground
                "
            >
              No products available right now.
            </p>
          </div>
        )}
      </section>

      {/* ================================================= */}
      {/* PROMO */}
      {/* ================================================= */}

      <section
        className="
          mx-auto
          max-w-[1600px]
          px-4
          pb-10
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            rounded-3xl
            bg-linear-to-r
            from-blue-600/10
            via-indigo-600/10
            to-purple-600/10
            px-5
            py-8
            sm:px-8
            sm:py-10
          "
        >
          <div
            className="
              flex
              flex-col
              items-start
              justify-between
              gap-6
              sm:flex-row
              sm:items-center
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-600
                  text-white
                "
              >
                <Zap className="h-7 w-7" />
              </div>

              <div>
                <p
                  className="
                    text-lg
                    font-bold
                    text-foreground
                  "
                >
                  Free returns on every order
                </p>

                <p
                  className="
                    mt-1
                    max-w-xl
                    text-sm
                    text-muted-foreground
                  "
                >
                  Not the right fit? Cancel eligible orders anytime before
                  shipment.
                </p>
              </div>
            </div>

            <Link href="/products" className="w-full sm:w-auto">
              <Button
                className="
                  h-11
                  w-full
                  bg-blue-600
                  px-6
                  font-semibold
                  text-white
                  hover:bg-blue-500
                  sm:w-auto
                "
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* FEATURES */}
      {/* ================================================= */}

      <section
        className="
          border-t
          border-border
          bg-card/50
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1600px]
            grid-cols-1
            gap-8
            px-4
            py-12
            sm:grid-cols-3
            sm:px-6
            lg:px-8
          "
        >
          {/* SHIPPING */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-500/10
              "
            >
              <Truck
                className="
                  h-6
                  w-6
                  text-blue-500
                "
              />
            </div>

            <div>
              <p
                className="
                  font-semibold
                  text-foreground
                "
              >
                Fast Shipping
              </p>

              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Estimated delivery on every order
              </p>
            </div>
          </div>

          {/* CHECKOUT */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-500/10
              "
            >
              <ShieldCheck
                className="
                  h-6
                  w-6
                  text-blue-500
                "
              />
            </div>

            <div>
              <p
                className="
                  font-semibold
                  text-foreground
                "
              >
                Secure Checkout
              </p>

              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Payments handled securely by Stripe
              </p>
            </div>
          </div>

          {/* CANCELLATION */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-500/10
              "
            >
              <RotateCcw
                className="
                  h-6
                  w-6
                  text-blue-500
                "
              />
            </div>

            <div>
              <p
                className="
                  font-semibold
                  text-foreground
                "
              >
                Easy Cancellation
              </p>

              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Cancel eligible orders anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
