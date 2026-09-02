"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useAuth } from "@/lib/context/AuthContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { User, LoyaltyTier } from "@/types/user";
import {
  User as UserIcon,
  Phone,
  Mail,
  Award,
  Sparkles,
  Store,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export interface ProfileHeaderProps {
  user?: User | null;
  loyaltyTier?: LoyaltyTier;
  className?: string;
}

export function ProfileHeader({
  user: propUser,
  loyaltyTier: propLoyaltyTier,
  className,
}: ProfileHeaderProps) {
  const { t, locale, direction } = useLocale();
  const auth = useAuth();
  const user = propUser !== undefined ? propUser : auth?.user;
  const loyaltyTier =
    propLoyaltyTier !== undefined ? propLoyaltyTier : auth?.loyaltyTier;
  const activeRole = auth?.activeRole || user?.role || "customer";
  const isSeller = activeRole === "seller" || user?.role === "seller" || user?.role === "admin";
  const isRtl = direction === "rtl";

  // Initials computation
  const getInitials = (name?: string) => {
    if (!name) return "ع";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2);
    return (parts[0][0] || "") + (parts[1][0] || "");
  };

  const initials = getInitials(user?.name);

  // Loyalty badge style
  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "gold":
        return {
          bg: "bg-amber-500/10 text-amber-700 border-amber-300",
          badge: "bg-gradient-to-r from-amber-500 to-yellow-600 text-white",
          labelAr: "عضوية ذهبية (Gold)",
          labelEn: "Gold Tier",
        };
      case "silver":
        return {
          bg: "bg-slate-500/10 text-slate-700 border-slate-300",
          badge: "bg-gradient-to-r from-slate-400 to-slate-600 text-white",
          labelAr: "عضوية فضية (Silver)",
          labelEn: "Silver Tier",
        };
      default:
        return {
          bg: "bg-orange-500/10 text-orange-700 border-orange-300",
          badge: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
          labelAr: "عضوية برونزية (Bronze)",
          labelEn: "Bronze Tier",
        };
    }
  };

  const tierInfo = getTierColor(loyaltyTier?.tier);

  return (
    <div
      className={cn(
        "bg-white border border-neutral-200/90 rounded-2xl p-4.5 shadow-sm space-y-4",
        className
      )}
    >
      {/* Top bar: Language toggle & Role indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-1.5">
          <Badge variant="brand" size="sm" className="font-bold">
            <ShieldCheck className="w-3.5 h-3.5 me-1" />
            <span>
              {activeRole === "seller"
                ? locale === "ar"
                  ? "حساب تاجر معتمد (Seller)"
                  : "Verified Seller Account"
                : locale === "ar"
                ? "مشتري معتمد (Customer)"
                : "Verified Customer"}
            </span>
          </Badge>
        </div>

        {/* Quick Language Toggle */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
        </div>
      </div>

      {/* Main Profile Info Row */}
      <div className="flex items-center gap-3.5">
        {/* Avatar / Initials */}
        <div className="relative w-16 h-16 rounded-full ring-2 ring-brand-100 p-0.5 shrink-0 bg-gradient-to-br from-brand-400 to-brand-600">
          <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || "User Avatar"}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full bg-brand-50 text-brand-600 font-bold text-lg flex items-center justify-center select-none">
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Name, Email, Phone */}
        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="text-base font-bold text-neutral-900 truncate leading-snug">
            {user?.name || (locale === "ar" ? "مستخدم سوقي" : "Souqi Customer")}
          </h2>

          {user?.phone && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 tabular-nums">
              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}

          {user?.email && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loyalty Tier Mini Card */}
      {loyaltyTier && (
        <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-neutral-50 rounded-xl p-3 border border-amber-200/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-950">
                  {locale === "ar" ? tierInfo.labelAr : tierInfo.labelEn}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium">
                {locale === "ar"
                  ? `${loyaltyTier.points} نقطة مكافآت`
                  : `${loyaltyTier.points} Reward Points`}
              </p>
            </div>
          </div>

          <div className="text-end">
            <span className="text-[10px] font-semibold text-neutral-500 block">
              {locale === "ar" ? "المستوى التالي" : "Next Tier"}
            </span>
            <span className="text-xs font-bold text-amber-900 tabular-nums">
              {loyaltyTier.points}/{loyaltyTier.next_tier_points}
            </span>
          </div>
        </div>
      )}

      {/* Seller Portal Quick CTA Banner if Seller */}
      {isSeller && (
        <div className="pt-1">
          <Link
            href={`/${locale}/seller/dashboard`}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-50 hover:bg-brand-100/80 border border-brand-200 text-brand-900 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-xs">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="text-start">
                <p className="text-xs font-bold text-brand-950">
                  {locale === "ar" ? "لوحة تحكم البائع" : "Seller Merchant Portal"}
                </p>
                <p className="text-[10px] text-brand-700">
                  {locale === "ar"
                    ? "إدارة المنتجات، الطلبات وتنبيهات المخزون"
                    : "Manage inventory, orders & AI copy"}
                </p>
              </div>
            </div>

            {isRtl ? (
              <ChevronLeft className="w-4 h-4 text-brand-600 group-hover:-translate-x-0.5 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 text-brand-600 group-hover:translate-x-0.5 transition-transform" />
            )}
          </Link>
        </div>
      )}
    </div>
  );
}

export default ProfileHeader;
