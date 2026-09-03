"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type { ProductImage, StockState } from "@/types/catalog";

export interface ProductGalleryProps {
  images?: (ProductImage | string)[];
  primaryImage?: string;
  productName?: string;
  isAiSuggested?: boolean;
  stockState?: StockState;
  availableQuantity?: number;
  className?: string;
}

export function ProductGallery({
  images = [],
  primaryImage,
  productName = "Product",
  isAiSuggested = false,
  stockState = "available",
  availableQuantity,
  className,
}: ProductGalleryProps) {
  const { direction, t } = useLocale();
  const isRtl = direction === "rtl";

  // Normalize image URLs into clean string array
  const imageList: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (images && images.length > 0) {
      images.forEach((img) => {
        if (typeof img === "string" && img.trim()) {
          list.push(img);
        } else if (img && typeof img === "object" && "image" in img && img.image) {
          list.push(img.image);
        }
      });
    }
    if (list.length === 0 && primaryImage) {
      list.push(primaryImage);
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80");
    }
    return list;
  }, [images, primaryImage]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const totalImages = imageList.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped Left
        if (isRtl) {
          goToPrev();
        } else {
          goToNext();
        }
      } else {
        // Swiped Right
        if (isRtl) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Keyboard navigation for lightbox & gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
        setLightboxZoom(1);
      } else if (e.key === "ArrowRight") {
        if (isRtl) goToPrev();
        else goToNext();
      } else if (e.key === "ArrowLeft") {
        if (isRtl) goToNext();
        else goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, isRtl, goToNext, goToPrev]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t("pdp.title", "معرض صور المنتج")}
      className={cn("relative w-full flex flex-col gap-3", className)}
    >
      {/* Main Image Viewport */}
      <div
        className="relative w-full aspect-square bg-neutral-100 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/70 select-none group touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Active Product Image */}
        <img
          src={imageList[currentIndex]}
          alt={`${productName} - ${currentIndex + 1}`}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {/* Floating Badges (Stock & AI Pick) */}
        <div className="absolute top-3.5 start-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isAiSuggested && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[#2563EB]/90 backdrop-blur-md text-white text-xs font-bold shadow-soft">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("catalog.aiSuggested", "اقتراح ذكي")}</span>
            </span>
          )}

          {stockState === "low_stock" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold shadow-soft">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>
                {availableQuantity !== undefined
                  ? t("catalog.lowStockCount", { count: availableQuantity }, `متبقي ${availableQuantity} فقط`)
                  : t("catalog.lowStock", "كمية محدودة")}
              </span>
            </span>
          )}

          {stockState === "out_of_stock" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-semantic-error/90 backdrop-blur-md text-white text-xs font-bold shadow-soft">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t("catalog.outOfStock", "غير متوفر حالياً")}</span>
            </span>
          )}
        </div>

        {/* Top-End Actions (Counter + Zoom Trigger) */}
        <div className="absolute top-3.5 end-3.5 flex items-center gap-2 z-10">
          {totalImages > 1 && (
            <span className="px-2.5 py-1 rounded-pill bg-black/55 backdrop-blur-md text-white text-[11px] font-bold numeric-data select-none">
              {currentIndex + 1} / {totalImages}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setIsLightboxOpen(true);
              setLightboxZoom(1);
            }}
            aria-label="تكبير الصورة"
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md text-neutral-800 hover:bg-white active:scale-95 transition-all shadow-sm flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Previous / Next Arrow Buttons */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={isRtl ? goToNext : goToPrev}
              aria-label="الصورة السابقة"
              className="absolute start-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md text-neutral-800 hover:bg-white active:scale-95 shadow-soft transition-all flex items-center justify-center opacity-90 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={isRtl ? goToPrev : goToNext}
              aria-label="الصورة التالية"
              className="absolute end-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md text-neutral-800 hover:bg-white active:scale-95 shadow-soft transition-all flex items-center justify-center opacity-90 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </>
        )}

        {/* Carousel Pagination Dots */}
        {totalImages > 1 && (
          <div className="absolute bottom-3.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
            {imageList.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === currentIndex
                    ? "w-6 bg-brand-500 shadow-sm"
                    : "w-2 bg-white/70 backdrop-blur-sm"
                )}
                aria-current={idx === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Row */}
      {totalImages > 1 && (
        <div
          role="tablist"
          aria-label="مصغرات الصور"
          className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar"
        >
          {imageList.map((imgUrl, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`عرض الصورة ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 active:scale-95",
                idx === currentIndex
                  ? "border-brand-500 ring-2 ring-brand-500/30 scale-105 shadow-sm"
                  : "border-neutral-200 opacity-70 hover:opacity-100 hover:border-neutral-300"
              )}
            >
              <img
                src={imgUrl}
                alt={`مصغرة ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom / Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="عرض مكبر للصورة"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200"
        >
          {/* Lightbox Header Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white z-10 px-4">
            <span className="text-sm font-medium numeric-data">
              {currentIndex + 1} / {totalImages}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.min(2.5, z + 0.5))}
                aria-label="تكبير"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.max(1, z - 0.5))}
                aria-label="تصغير"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <ZoomOut className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(1);
                }}
                aria-label="إغلاق المعاينة المكبرة"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white ms-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Viewport */}
          <div
            className="relative flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden touch-pan-y p-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={imageList[currentIndex]}
              alt={`${productName} مكبرة`}
              style={{ transform: `scale(${lightboxZoom})` }}
              className="max-w-full max-h-[75vh] object-contain transition-transform duration-200 cursor-zoom-in select-none rounded-2xl"
              onClick={() => setLightboxZoom((z) => (z === 1 ? 1.8 : 1))}
            />
          </div>

          {/* Lightbox Bottom Controls */}
          {totalImages > 1 && (
            <div className="w-full max-w-4xl flex items-center justify-between text-white pb-safe px-4">
              <button
                type="button"
                onClick={isRtl ? goToNext : goToPrev}
                className="px-4 py-2 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center gap-1.5 text-sm font-semibold"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{t("common.back", "السابق")}</span>
              </button>

              {/* Lightbox thumbnail indicator dots */}
              <div className="flex items-center gap-1.5">
                {imageList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all min-h-[16px] flex items-center",
                      idx === currentIndex ? "w-6 bg-brand-500" : "w-2 bg-white/40"
                    )}
                    aria-label={`انتقال للصورة ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={isRtl ? goToPrev : goToNext}
                className="px-4 py-2 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center gap-1.5 text-sm font-semibold"
              >
                <span>{t("common.continue", "التالي")}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
