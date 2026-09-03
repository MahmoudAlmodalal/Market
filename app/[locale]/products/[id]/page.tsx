"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  RefreshCw,
  PackageX,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
} from "lucide-react";
import {
  ProductGallery,
  ProductInfo,
  VariantSelector,
  SellerTrustCard,
  StickyActionBar,
  ReviewList,
} from "@/components/pdp";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getProductById,
  getSellerById,
  getReviewsByProductId,
  getRelatedProducts,
  getProductVariants,
  type ExtendedSeller,
  type ExtendedReview,
  type ProductVariant,
} from "@/lib/mock/sellers";
import type { Product } from "@/types/catalog";
import type { Locale } from "@/types/i18n";

export interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function ProductDetailPage(props: ProductDetailPageProps) {
  // Unwrap params using React.use for Next.js 15 App Router compatibility
  const resolvedParams = use(props.params);
  const rawLocale = resolvedParams.locale as Locale;
  const productIdStr = resolvedParams.id;

  const { direction, t } = useLocale();
  const isRtl = direction === "rtl";
  const router = useRouter();

  // 4-state lifecycle state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<ExtendedSeller | null>(null);
  const [reviews, setReviews] = useState<ExtendedReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [variantGroups, setVariantGroups] = useState<ReturnType<typeof getProductVariants>>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [variantPriceDelta, setVariantPriceDelta] = useState<number>(0);
  const [selectedVariantName, setSelectedVariantName] = useState<string>("");

  const loadProductData = () => {
    setLoading(true);
    setError(null);

    try {
      const numId = parseInt(productIdStr, 10);
      if (isNaN(numId) || numId <= 0) {
        setProduct(null);
        setLoading(false);
        return;
      }

      // Fetch product
      const foundProduct = getProductById(numId);
      if (!foundProduct) {
        setProduct(null);
        setLoading(false);
        return;
      }

      // Fetch seller
      const sellerId = foundProduct.seller?.id || 101;
      const foundSeller = getSellerById(sellerId) || getSellerById(101) || null;
      setSeller(foundSeller);

      const productWithSeller: Product = {
        ...foundProduct,
        seller: foundProduct.seller || (foundSeller ? {
          id: foundSeller.id,
          business_name: foundSeller.name || foundSeller.business_name,
          neighborhood: foundSeller.neighborhood,
          city: foundSeller.city,
          rating: foundSeller.rating,
          review_count: foundSeller.reviewCount,
          delivery_time: foundSeller.deliveryTimeEstimate,
          is_verified: foundSeller.is_verified,
        } : undefined),
      };

      setProduct(productWithSeller);

      // Fetch reviews
      const foundReviews = getReviewsByProductId(foundProduct.id);
      setReviews(foundReviews);

      // Fetch related products
      const related = getRelatedProducts(foundProduct.id, 4);
      setRelatedProducts(related);

      // Fetch variants
      const groups = getProductVariants(foundProduct.id);
      setVariantGroups(groups);

      // Initialize default selected variants (first in-stock option)
      const initialSelected: Record<string, string> = {};
      let initialDelta = 0;
      let initialName = "";

      groups.forEach((g) => {
        const firstAvailable = g.options.find((opt) => opt.in_stock) || g.options[0];
        if (firstAvailable) {
          initialSelected[g.id] = String(firstAvailable.id);
          initialDelta += firstAvailable.priceDelta || 0;
          initialName = firstAvailable.name;
        }
      });

      setSelectedVariants(initialSelected);
      setVariantPriceDelta(initialDelta);
      setSelectedVariantName(initialName);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "فشل في تحميل بيانات المنتج");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [productIdStr, rawLocale]);

  const handleSelectVariant = (groupId: string, variant: ProductVariant) => {
    const nextSelected = {
      ...selectedVariants,
      [groupId]: String(variant.id),
    };
    setSelectedVariants(nextSelected);

    // Recalculate price delta and name summary
    let delta = 0;
    const names: string[] = [];

    variantGroups.forEach((g) => {
      const selectedId = nextSelected[g.id];
      const opt = g.options.find((o) => String(o.id) === selectedId);
      if (opt) {
        delta += opt.priceDelta || 0;
        names.push(opt.name);
      }
    });

    setVariantPriceDelta(delta);
    setSelectedVariantName(names.join(" - "));
  };

  const scrollToReviews = () => {
    const el = document.getElementById("product-reviews-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // =========================================================================
  // STATE 1: LOADING SKELETON STATE
  // =========================================================================
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-neutral-50/50 pb-24 animate-in fade-in duration-150">
        {/* Top Header Skeleton */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 flex items-center justify-between max-w-[1600px] 2xl:max-w-[1800px] mx-auto">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-32 sm:w-48 h-4 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>

        <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <Skeleton className="w-full aspect-square rounded-3xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <Skeleton className="w-16 h-16 rounded-xl" />
              <Skeleton className="w-16 h-16 rounded-xl" />
            </div>
            <Skeleton className="w-full h-48 rounded-2xl" />
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Skeleton className="w-24 h-6 rounded-pill" />
            <Skeleton className="w-full h-8 rounded-lg" />
            <Skeleton className="w-3/4 h-8 rounded-lg" />
            <Skeleton className="w-36 h-8 rounded-lg" />
            <Skeleton className="w-full h-32 rounded-2xl" />
            <Skeleton className="w-full h-36 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: ERROR + RETRY STATE
  // =========================================================================
  if (error) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center max-w-md sm:max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-semantic-error flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 font-cairo">
          {t("common.error", "حدث خطأ أثناء تحميل المنتج")}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-xs sm:max-w-sm leading-relaxed font-sans">
          {error}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadProductData}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-soft transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t("common.retry", "إعادة المحاولة")}</span>
          </button>
          <Link
            href={`/${rawLocale}/catalog`}
            className="inline-flex items-center px-4 py-2.5 min-h-[44px] rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 text-xs sm:text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {t("nav.catalog", "العودة للسوق")}
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 3: EMPTY / NOT FOUND STATE
  // =========================================================================
  if (!product) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center max-w-md sm:max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-neutral-100 border border-neutral-200 text-neutral-400 flex items-center justify-center mb-4 shadow-inner">
          <PackageX className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-2 font-cairo">
          {rawLocale === "en" ? "Product Not Found" : "المنتج غير موجود"}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-xs sm:max-w-sm leading-relaxed font-sans">
          {rawLocale === "en"
            ? "The item you are looking for may have been removed or is temporarily unavailable in your area."
            : "المنتج الذي تبحث عنه قد يكون تم حذفه أو غير متوفر حالياً في منطقتك."}
        </p>
        <Link
          href={`/${rawLocale}/catalog`}
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-soft transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Home className="w-4 h-4" />
          <span>{rawLocale === "en" ? "Browse Marketplace" : "تصفح السوق والمنتجات"}</span>
        </Link>
      </div>
    );
  }

  // =========================================================================
  // STATE 4: DEFAULT PRODUCT DETAIL VIEW
  // =========================================================================
  return (
    <div className="w-full min-h-screen bg-neutral-50/40 pb-32 lg:pb-16 select-text animate-in fade-in duration-200">
      {/* Top Navigation & Breadcrumb Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-3.5 sm:px-6 lg:px-8 xl:px-12 py-2.5">
        <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t("common.back", "رجوع")}
            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center text-neutral-700 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Centered Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500 truncate max-w-[70%] font-medium">
            <Link
              href={`/${rawLocale}/catalog`}
              className="hover:text-brand-600 transition-colors shrink-0"
            >
              {t("nav.catalog", "السوق")}
            </Link>
            <span className="text-neutral-300">/</span>
            {product.category?.name && (
              <>
                <Link
                  href={`/${rawLocale}/catalog?category=${product.category.id}`}
                  className="hover:text-brand-600 transition-colors truncate max-w-[120px]"
                >
                  {product.category.name}
                </Link>
                <span className="text-neutral-300">/</span>
              </>
            )}
            <span className="text-neutral-900 font-bold truncate">
              {product.name}
            </span>
          </div>

          {/* Home shortcut trigger with 44px tap area */}
          <Link
            href={`/${rawLocale}`}
            aria-label={t("nav.home", "الرئيسية")}
            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center text-neutral-700 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>

      {/* Main Content Area: Responsive 2-column layout on Desktop (>=1024px / lg:) */}
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* =========================================================================
              LEFT COLUMN (lg:col-span-7): Sticky Gallery, Reviews & Related Items
             ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Image Gallery */}
            <ProductGallery
              images={product.images}
              primaryImage={product.primary_image}
              productName={product.name}
              isAiSuggested={product.is_ai_suggested}
              stockState={product.stock_state}
              availableQuantity={product.available_quantity ?? product.stock_quantity}
            />

            {/* 2. Customer Review List */}
            <div className="hidden lg:block">
              <ReviewList
                reviews={reviews}
                productId={product.id}
                sellerName={seller?.name || product.seller_name}
              />
            </div>

            {/* 3. Related / Similar Products Section */}
            {relatedProducts.length > 0 && (
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-cairo">
                    {t("pdp.similarProducts", "منتجات مشابهة قد تعجبك")}
                  </h3>
                  <Link
                    href={`/${rawLocale}/catalog?category=${product.category?.id || 1}`}
                    className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700"
                  >
                    {t("common.viewAll", "عرض الكل")}
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {relatedProducts.slice(0, 4).map((rel) => (
                    <ProductCard key={rel.id} product={rel} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              RIGHT COLUMN (lg:col-span-5): Product Info, Variants, Purchase & Seller
             ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-20">
            {/* 1. Product Metadata & Info */}
            <ProductInfo
              product={product}
              rating={seller?.rating ?? 4.9}
              reviewCount={reviews.length || 12}
              onReviewsClick={scrollToReviews}
            />

            {/* 2. Product Variant Selector */}
            {variantGroups.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-soft">
                <VariantSelector
                  groups={variantGroups}
                  selectedVariants={selectedVariants}
                  onSelectVariant={handleSelectVariant}
                />
              </div>
            )}

            {/* 3. Seller Trust Card */}
            <SellerTrustCard
              seller={seller || product.seller}
              sellerId={seller?.id || product.seller?.id}
              sellerName={product.seller_name || seller?.name}
            />

            {/* 4. Trust & Quality Guarantees Strip */}
            <div className="grid grid-cols-3 gap-2 bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200/90 shadow-soft text-center">
              <div className="flex flex-col items-center gap-1 p-1">
                <Award className="w-5 h-5 text-brand-500" />
                <span className="text-[11px] sm:text-xs font-bold text-neutral-800">
                  {rawLocale === "en" ? "100% Authentic" : "جودة وأصالة"}
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500">
                  {rawLocale === "en" ? "Handmade & fresh" : "صناعة يدوية بيتية"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1 p-1 border-x border-neutral-100">
                <Truck className="w-5 h-5 text-brand-500" />
                <span className="text-[11px] sm:text-xs font-bold text-neutral-800">
                  {rawLocale === "en" ? "Fast Delivery" : "توصيل سريع"}
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500">
                  {rawLocale === "en" ? "Direct from maker" : "مباشرة من المتجر"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1 p-1">
                <ShieldCheck className="w-5 h-5 text-brand-500" />
                <span className="text-[11px] sm:text-xs font-bold text-neutral-800">
                  {rawLocale === "en" ? "Guaranteed" : "ضمان الرضا"}
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500">
                  {rawLocale === "en" ? "Verified artisans" : "حرفيون موثوقون"}
                </span>
              </div>
            </div>

            {/* 5. Mobile Review List (visible on mobile only, placed below info) */}
            <div className="block lg:hidden">
              <ReviewList
                reviews={reviews}
                productId={product.id}
                sellerName={seller?.name || product.seller_name}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 8. Pinned Sticky Action Bar (visible on all viewports, desktop responsive container) */}
      <StickyActionBar
        product={product}
        selectedVariantDelta={variantPriceDelta}
        selectedVariantName={selectedVariantName}
      />
    </div>
  );
}

