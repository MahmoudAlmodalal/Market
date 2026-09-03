"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/context/LocaleContext";
import { useAuth } from "@/lib/context/AuthContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/api/types";
import {
  Mail,
  Store,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export interface ProfileHeaderProps {
  user?: AuthUser | null;
  className?: string;
}

export function ProfileHeader({
  user: propUser,
  className,
}: ProfileHeaderProps) {
  const { locale, direction } = useLocale();
  const auth = useAuth();
  const user = propUser !== undefined ? propUser : auth?.user;
  const isSeller = user?.role === "seller" || user?.role === "admin";
  const isRtl = direction === "rtl";

  // Initials computation
  const getInitials = (name?: string) => {
    if (!name) return "ع";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2);
    return (parts[0][0] || "") + (parts[1][0] || "");
  };

  const initials = getInitials(user?.name);

  const roleLabel = (() => {
    if (user?.role === "admin") {
      return locale === "ar" ? "مدير النظام (Admin)" : "System Admin";
    }
    if (user?.role === "seller") {
      return locale === "ar"
        ? "حساب تاجر معتمد (Seller)"
        : "Verified Seller Account";
    }
    return locale === "ar"
      ? "مشتري معتمد (Customer)"
      : "Verified Customer";
  })();

  return (
    <div
      className={cn(
        "bg-white border border-neutral-200/90 rounded-2xl p-4.5 shadow-sm space-y-4",
        className
      )}
    >
      {/* Top bar: Role indicator & Language toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-1.5">
          <Badge variant="brand" size="sm" className="font-bold">
            <ShieldCheck className="w-3.5 h-3.5 me-1" />
            <span>{roleLabel}</span>
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
            <div className="w-full h-full bg-brand-50 text-brand-600 font-bold text-lg flex items-center justify-center select-none">
              {initials}
            </div>
          </div>
        </div>

        {/* Name, Email */}
        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="text-base font-bold text-neutral-900 truncate leading-snug">
            {user?.name || (locale === "ar" ? "مستخدم سوقي" : "Souqi User")}
          </h2>

          {user?.email && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Seller Portal Quick CTA Banner if Seller or Admin */}
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
