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
      className={cn("w-full relative px-3 sm:px-6 lg:px-8 xl:px-12 select-none", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Banners"
    >
      <div
        className="w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] lg:aspect-[28/9] min-h-[195px] sm:min-h-[260px] lg:min-h-[320px] xl:min-h-[360px] max-h-[460px] relative rounded-card overflow-hidden shadow-soft-md border border-neutral-200/80 bg-neutral-900"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent rtl:bg-gradient-to-l rtl:from-black/60 rtl:via-transparent rtl:to-transparent" />

            {/* Content Details with dynamic responsive scaling */}
            <div className="absolute inset-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-end text-start z-20">
              {banner.badge && (
                <div className="mb-1.5 sm:mb-2 flex items-center">
                  <span className="inline-flex items-center gap-1 bg-brand-500/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-pill shadow-glow">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{banner.badge}</span>
                  </span>
                </div>
              )}

              {/* Dynamic typography scaling from mobile text-base to desktop text-3xl */}
              <h3 className="text-white text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight line-clamp-1 drop-shadow-sm">
                {banner.title}
              </h3>

              {banner.subtitle && (
                <p className="text-neutral-200 text-xs sm:text-sm lg:text-base line-clamp-2 mt-0.5 sm:mt-1 font-normal opacity-95 max-w-xl">
                  {banner.subtitle}
                </p>
              )}

              {/* Action Button with 44px minimum touch target */}
              {banner.cta_text && (
                <div className="mt-2.5 sm:mt-3.5">
                  <Link
                    href={`/${locale}${banner.link.startsWith("/") ? banner.link : `/${banner.link}`}`}
                    onClick={(e) => {
                      if (onCtaClick) {
                        e.preventDefault();
                        onCtaClick(banner);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 bg-white text-brand-600 hover:bg-brand-50 active:bg-brand-100 text-xs sm:text-sm font-bold px-4 py-2 min-h-[44px] rounded-pill transition-all duration-150 shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span>{banner.cta_text}</span>
                    {isRtl ? (
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Carousel Arrow Controls with 44x44px touch targets */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={isRtl ? nextSlide : prevSlide}
              aria-label="Previous slide"
              className="absolute start-3 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] rounded-full bg-black/40 hover:bg-black/60 active:scale-90 text-white backdrop-blur-sm transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={isRtl ? prevSlide : nextSlide}
              aria-label="Next slide"
              className="absolute end-3 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] rounded-full bg-black/40 hover:bg-black/60 active:scale-90 text-white backdrop-blur-sm transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </>
        )}

        {/* Dot Pagination Indicators */}
        {count > 1 && (
          <div className="absolute bottom-3 end-4 sm:end-6 z-30 flex items-center gap-1.5">
            {banners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 min-h-[16px] flex items-center",
                  dotIdx === currentIndex
                    ? "w-6 bg-brand-500 shadow-glow"
                    : "w-2 bg-white/50 hover:bg-white/80"
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

