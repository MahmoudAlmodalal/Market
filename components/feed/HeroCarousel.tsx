"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { PromotionalBanner } from "@/types/catalog";
import { useLocale } from "@/lib/context/LocaleContext";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

export interface HeroCarouselProps {
  banners: PromotionalBanner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onCtaClick?: (banner: PromotionalBanner) => void;
  className?: string;
}

export function HeroCarousel({
  banners,
  autoPlay = true,
  autoPlayInterval = 4500,
  onCtaClick,
  className,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const { direction, locale } = useLocale();
  const isRtl = direction === "rtl";

  const count = banners.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (count || 1));
  }, [count]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % (count || 1));
  }, [count]);

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay || isPaused || count <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, autoPlayInterval, count, nextSlide]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left
        if (isRtl) {
          prevSlide();
        } else {
          nextSlide();
        }
      } else {
        // Swiped right
        if (isRtl) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("w-full relative px-4 select-none", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Banners"
    >
      <div
        className="w-full aspect-[16/9] min-h-[195px] max-h-[240px] relative rounded-card overflow-hidden shadow-soft-md border border-neutral-200/80 bg-neutral-900"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Banner Images Carousel */}
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-in-out",
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            {/* Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-7000 ease-out"
            />

            {/* Gradient Overlays for High Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent rtl:bg-gradient-to-l rtl:from-black/60 rtl:via-transparent rtl:to-transparent" />

            {/* Content Details */}
            <div className="absolute inset-0 p-4.5 flex flex-col justify-end text-start z-20">
              {banner.badge && (
                <div className="mb-1.5 flex items-center">
                  <span className="inline-flex items-center gap-1 bg-brand-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-pill shadow-glow">
                    <Sparkles className="w-3 h-3" />
                    <span>{banner.badge}</span>
                  </span>
                </div>
              )}

              <h3 className="text-white text-base sm:text-lg font-bold leading-tight line-clamp-1 drop-shadow-sm">
                {banner.title}
              </h3>

              {banner.subtitle && (
                <p className="text-neutral-200 text-xs line-clamp-1 mt-0.5 font-normal opacity-95">
                  {banner.subtitle}
                </p>
              )}

              {/* Action Button */}
              {banner.cta_text && (
                <div className="mt-2.5">
                  <Link
                    href={`/${locale}${banner.link.startsWith("/") ? banner.link : `/${banner.link}`}`}
                    onClick={(e) => {
                      if (onCtaClick) {
                        e.preventDefault();
                        onCtaClick(banner);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 bg-white text-brand-600 hover:bg-brand-50 active:bg-brand-100 text-xs font-bold px-3.5 py-1.5 rounded-pill transition-all duration-150 shadow-sm active:scale-95"
                  >
                    <span>{banner.cta_text}</span>
                    {isRtl ? (
                      <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Carousel Arrow Controls (Visual overlay on hover/desktop, tap on mobile) */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={isRtl ? nextSlide : prevSlide}
              aria-label="Previous slide"
              className="absolute start-2 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-black/30 hover:bg-black/50 active:scale-90 text-white backdrop-blur-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={isRtl ? prevSlide : nextSlide}
              aria-label="Next slide"
              className="absolute end-2 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-black/30 hover:bg-black/50 active:scale-90 text-white backdrop-blur-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </>
        )}

        {/* Dot Pagination Indicators */}
        {count > 1 && (
          <div className="absolute bottom-2.5 end-4 z-30 flex items-center gap-1.5">
            {banners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  dotIdx === currentIndex
                    ? "w-5 bg-brand-500 shadow-glow"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroCarousel;
