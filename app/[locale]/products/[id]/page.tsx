import React from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/client";
import {
  ProductGallery,
  ProductInfo,
  StickyActionBar,
  ProductDetailHeader,
} from "@/components/pdp";
import { Award, ShieldCheck, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function ProductDetailPage(props: ProductDetailPageProps) {
  const { locale, id } = await props.params;
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    notFound();
  }

  let product;
  try {
    product = await getProduct(numId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const rawLocale = locale;

  return (
    <div className="w-full min-h-screen bg-neutral-50/40 pb-32 lg:pb-16 select-text animate-in fade-in duration-200">
      {/* Top Navigation & Breadcrumb Header Bar */}
      <ProductDetailHeader
        productName={product.name}
        category={product.category}
      />

      {/* Main Content Area: Responsive 2-column layout on Desktop (>=1024px / lg:) */}
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT COLUMN (lg:col-span-7): Sticky Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ProductGallery
              images={product.images}
              primaryImage={product.images?.[0]?.image}
              productName={product.name}
              stockState={product.stock_state as any}
              availableQuantity={product.available_quantity}
            />
          </div>

          {/* RIGHT COLUMN (lg:col-span-5): Product Info, Purchase & Guarantees */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-20">
            <ProductInfo product={product} />

            {/* Trust & Quality Guarantees Strip */}
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
          </div>
        </div>
      </div>

      {/* Pinned Sticky Action Bar */}
      <StickyActionBar product={product} />
    </div>
  );
}
