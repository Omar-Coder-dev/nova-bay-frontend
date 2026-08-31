"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Sparkles } from "lucide-react";

const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: "New arrivals every week",
    title: "Shop smarter with Nova Bay",
    subtitle: "Quality products, honest prices, and fast checkout.",
    cta: "Shop All Products",
    href: "/products",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
  },
  {
    id: 2,
    eyebrow: "Limited-time offer",
    title: "Top-rated electronics",
    subtitle:
      "Headphones, smartwatches, and more — customer favorites.",
    cta: "Shop Electronics",
    href: "/products?category=electronics",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
  },
  {
    id: 3,
    eyebrow: "Refresh your space",
    title: "Home & Kitchen essentials",
    subtitle:
      "Everything you need to upgrade your everyday routine.",
    cta: "Shop Home & Kitchen",
    href: "/products?category=home_and_kitchen",
    gradient: "from-orange-600 via-rose-600 to-pink-600",
  },
];

export function HeroCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const scrollToSlide = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const safeIndex =
      ((index % HERO_SLIDES.length) + HERO_SLIDES.length) %
      HERO_SLIDES.length;

    el.scrollTo({
      left: el.clientWidth * safeIndex,
      behavior: "smooth",
    });

    setActiveIndex(safeIndex);
  }, []);

  const nextSlide = useCallback(() => {
    scrollToSlide(activeIndex + 1);
  }, [activeIndex, scrollToSlide]);

  /*
   * Detect which slide is currently visible.
   */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;

    if (!el || !el.clientWidth) return;

    const index = Math.round(
      el.scrollLeft / el.clientWidth
    );

    if (
      index >= 0 &&
      index < HERO_SLIDES.length &&
      index !== activeIndex
    ) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  /*
   * Mouse dragging for desktop.
   * Mobile uses native browser scrolling.
   */
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
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
      el.scrollLeft =
        startScrollLeft.current - distance;
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

    /*
     * Don't allow a drag to accidentally activate
     * the button/link underneath.
     */
    if (hasMoved.current) {
      requestAnimationFrame(() => {
        hasMoved.current = false;
      });
    }
  };

  /*
   * Autoplay.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDragging) {
        nextSlide();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isDragging, nextSlide]);

  return (
    <section className="relative overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        className={`flex w-full overflow-x-auto overscroll-x-contain snap-x snap-mandatory
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
        {HERO_SLIDES.map((slide) => (
          <div
            key={slide.id}
            className={`
              relative
              w-full
              shrink-0
              snap-start
              bg-linear-to-br
              ${slide.gradient}
              px-4
              py-20
              sm:py-28
            `}
          >
            <div className="pointer-events-none absolute inset-0 bg-black/10" />

            <div className="relative mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" />

                {slide.eyebrow}
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                {slide.title}
              </h1>

              <p className="mt-5 text-lg text-white/90">
                {slide.subtitle}
              </p>

              <div className="mt-8">
                <Link
                  href={slide.href}
                  onClick={(e) => {
                    if (hasMoved.current) {
                      e.preventDefault();
                      hasMoved.current = false;
                    }
                  }}
                >
                  <Button className="h-12 bg-white px-8 font-semibold text-slate-900 hover:bg-white/90">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => scrollToSlide(index)}
            className={`
              h-2
              rounded-full
              transition-[width,opacity]
              duration-200
              ${
                index === activeIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}