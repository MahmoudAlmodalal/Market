"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import type { Seller, SellerSummary } from "@/types/catalog";
import type { ExtendedSeller } from "@/lib/mock/sellers";

export interface SellerTrustCardProps {
  seller?: Seller | SellerSummary | ExtendedSeller;
  sellerId?: number;
  sellerName?: string;
  className?: string;
}

export function SellerTrustCard({
  seller,
  sellerId,
  sellerName,
  className,
}: SellerTrustCardProps) {
  const { locale, direction, t } = useLocale();
  const isRtl = direction === "rtl";

  // Resolve seller properties with robust fallbacks
  const ext = seller as Partial<ExtendedSeller> | undefined;
  const name =
    seller?.business_name ||
    ext?.name ||
    sellerName ||
    "متجر محلي معتمد";
  const nameEn = ext?.name_en || ext?.business_name_en || name;
  const displayName = locale === "en" ? nameEn : name;

  const id = seller?.id || sellerId || ext?.id || 101;
  const rating = seller?.rating ?? ext?.rating ?? 4.9;
  const reviewCount =
    ext?.reviewCount ??
    seller?.review_count ??
    ext?.review_count ??
    128;
  const deliveryTime =
    ext?.deliveryTimeEstimate ??
    seller?.delivery_time ??
    ext?.delivery_time ??
    "30-45 دقيقة";
  const neighborhood =
    seller?.neighborhood ??
    ext?.neighborhood ??
    "وسط البلد";
  const city = seller?.city ?? ext?.city ?? "رام الله";
  const branch =
    ext?.branch ??
    (neighborhood && city ? `${city} - ${neighborhood}` : "رام الله - وسط البلد");
  const phone = ext?.phone || "+970599112233";
  const whatsapp = ext?.whatsapp || phone;
  const badge =
    ext?.badge ||
    (seller?.is_verified ? "حرفي محلي موثق" : "بائع محلي موثق");
  const badgeEn = ext?.badge_en || (seller?.is_verified ? "Verified Local Artisan" : "Verified Merchant");
  const displayBadge = locale === "en" ? badgeEn : badge;
  const logo = seller?.logo || ext?.avatar;

  return (
    <div
      className={cn(
        "w-full bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-soft flex flex-col gap-3.5 transition-all hover:shadow-soft-lg",
        className
      )}
    >
      {/* Top Header: Avatar, Name, Verification Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Store Logo / Avatar */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={displayName}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <Store className="w-6 h-6 text-brand-500" />
            )}
          </div>

          {/* Store Identity */}
          <div className="flex flex-col text-start">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-neutral-900 leading-snug font-cairo">
                {displayName}
              </h3>
              <span className="inline-flex items-center gap-0.5 text-brand-600 bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded-pill text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-brand-500 shrink-0" />
                <span>{displayBadge}</span>
              </span>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-extrabold text-neutral-900 numeric-data">
                  {rating.toFixed(1)}
                </span>
              </div>
              <span className="text-[11px] font-medium text-neutral-500 numeric-data">
                ({reviewCount} {t("pdp.reviews", "تقييم")})
              </span>
            </div>
          </div>
        </div>

        {/* Visit Store Action Link */}
        <Link
          href={`/${locale}/catalog?seller=${id}`}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50/80 hover:bg-brand-100/80 px-2.5 py-1.5 rounded-xl border border-brand-100 transition-all flex items-center gap-1 shrink-0 active:scale-95"
          aria-label={`زيارة متجر ${displayName}`}
        >
          <span>{t("pdp.sellerInfo", "المتجر")}</span>
          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </Link>
      </div>

      {/* Metadata Badges Strip: Location & Delivery Time */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-1.5 text-neutral-600 bg-neutral-50/80 px-2.5 py-1.5 rounded-xl border border-neutral-100 text-xs">
          <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span className="truncate font-medium">{branch}</span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-600 bg-neutral-50/80 px-2.5 py-1.5 rounded-xl border border-neutral-100 text-xs">
          <Clock className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span className="truncate font-medium">{deliveryTime}</span>
        </div>
      </div>

      {/* Direct Vendor Contact Actions */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href={`tel:${phone}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 hover:text-neutral-900 active:scale-95 transition-all shadow-2xs"
        >
          <Phone className="w-3.5 h-3.5 text-neutral-600" />
          <span className="numeric-data">{phone}</span>
        </a>

        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="مراسلة عبر واتساب"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] text-xs font-bold hover:bg-[#25D366]/20 active:scale-95 transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>واتساب</span>
          </a>
        )}
      </div>
    </div>
  );
}

export default SellerTrustCard;
