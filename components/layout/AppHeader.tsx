"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Bell,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNeighborhood?: boolean;
  selectedNeighborhood?: string;
  onSelectNeighborhood?: () => void;
  unreadNotifications?: boolean;
  unreadCount?: number;
  className?: string;
  rightAction?: React.ReactNode;
}

/**
 * AppHeader renders the top navigation chrome for Souqi Marketplace.
 * Features: Souqi Coral Logo, Neighborhood selector chip, Notification bell with unread dot, and LanguageToggle.
 */
export function AppHeader({
  title,
  showBack = false,
  onBack,
  showNeighborhood = true,
  selectedNeighborhood,
  onSelectNeighborhood,
  unreadNotifications = true,
  unreadCount = 2,
  className,
  rightAction,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const { locale, direction } = useLocale();
  const router = useRouter();
  const [district, setDistrict] = useState(
    selectedNeighborhood || (locale === "ar" ? "حي الرمال" : "Al-Rimal")
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-2.5 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Leading section: Back button OR Souqi Logo */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ms-1 text-neutral-700 hover:text-neutral-900 rounded-full hover:bg-neutral-100 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              aria-label={t("common.back", "رجوع")}
            >
              <BackIcon className="w-5 h-5" />
            </button>
          ) : null}

          {title ? (
            <h1 className="text-lg font-bold text-neutral-900 truncate">
              {title}
            </h1>
          ) : (
            <Link
              href={`/${locale}`}
              className="flex items-center gap-1.5 text-brand-500 hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg p-0.5"
              aria-label={t("common.appName", "سوقي")}
            >
              <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-soft-sm">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-brand-500 leading-tight">
                  {locale === "ar" ? "سوقي" : "Souqi"}
                </span>
                <span className="text-[10px] font-medium text-neutral-500 leading-none -mt-0.5">
                  {locale === "ar" ? "سوق محلي" : "Local Market"}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Center / Secondary: Neighborhood Chip (if in home/standard mode) */}
        {!title && showNeighborhood ? (
          <button
            type="button"
            onClick={onSelectNeighborhood}
            className="flex items-center gap-1 px-2.5 py-1 rounded-pill bg-neutral-100/90 hover:bg-neutral-200/70 border border-neutral-200/60 text-xs font-semibold text-neutral-800 transition-all max-w-[130px] truncate active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            aria-label={`${t("header.location", "الموقع")}: ${district}`}
          >
            <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">{district}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>
        ) : null}

        {/* Trailing actions: Notifications, Language Switcher, Custom Actions */}
        <div className="flex items-center gap-2">
          {rightAction ? (
            rightAction
          ) : (
            <>
              {/* Notification Bell */}
              <Link
                href={`/${locale}/notifications`}
                className="relative p-2 text-neutral-700 hover:text-neutral-900 rounded-full hover:bg-neutral-100 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                aria-label={t("header.notifications", "الإشعارات")}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications && (
                  <span className="absolute top-1.5 end-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500 ring-2 ring-white" />
                  </span>
                )}
              </Link>

              {/* Language Toggle */}
              <LanguageToggle variant="pill" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
