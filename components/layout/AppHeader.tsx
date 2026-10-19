"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { useOptionalNotifications } from "@/lib/context/NotificationContext";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Bell,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Menu,
  X,
  Home,
  LayoutGrid,
  Package,
  User,
  Search,
  Sparkles,
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
 * AppHeader renders a modern, fully responsive navigation bar for Souqi Marketplace.
 * - Mobile (<768px): Compact header with hamburger drawer, logo/back button, location chip, notifications & cart.
 * - Desktop (>=768px): Full-width navbar with branded logo, navigation links, quick search, neighborhood selector, notifications, cart with counter, and user profile.
 */
export function AppHeader({
  title,
  showBack = false,
  onBack,
  showNeighborhood = true,
  selectedNeighborhood,
  onSelectNeighborhood,
  unreadNotifications: propUnreadNotifications,
  unreadCount: propUnreadCount,
  className,
  rightAction,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const { locale, direction } = useLocale();
  const pathname = usePathname() || `/${locale}`;
  const router = useRouter();
  const cartContext = useCart();
  const cartItemCount = cartContext?.itemCount ?? 0;
  const notifContext = useOptionalNotifications();

  const unreadNotifications =
    propUnreadNotifications !== undefined
      ? propUnreadNotifications
      : notifContext
      ? notifContext.hasUnread
      : true;

  const unreadCount =
    propUnreadCount !== undefined
      ? propUnreadCount
      : notifContext
      ? notifContext.unreadCount
      : 2;

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
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

  const navLinks: {
    label: string;
    href: string;
    icon: typeof Home;
    matchExact: boolean;
    badge?: string;
  }[] = [
    {
      label: t("nav.home", "الرئيسية"),
      href: `/${locale}`,
      icon: Home,
      matchExact: true,
    },
    {
      label: t("nav.catalog", "المنتجات"),
      href: `/${locale}/catalog`,
      icon: LayoutGrid,
      matchExact: false,
    },
    {
      label: t("nav.orders", "طلباتي"),
      href: `/${locale}/orders`,
      icon: Package,
      matchExact: false,
    },
  ];

  return (
    <>
      <header
        className={cn(
          // Fluid full-width header with backdrop blur and safe-area top inset support
          "sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all duration-200",
          "pt-[max(env(safe-area-inset-top),0px)] px-3 sm:px-6 lg:px-8 xl:px-12 py-2.5",
          className
        )}
      >
        <div className="w-full max-w-[1700px] 2xl:max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* =========================================================================
              1. LEADING SECTION: Hamburger (Mobile) / Back Button / Brand Logo
             ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Hamburger Menu Button (<768px) with 44x44px minimum touch target */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={locale === "ar" ? "فتح القائمة الرئيسية" : "Open Navigation Menu"}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Back Button (Conditional) with 44x44px touch target */}
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] text-neutral-700 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={t("common.back", "رجوع")}
              >
                <BackIcon className="w-5 h-5" />
              </button>
            ) : null}

            {/* Title (if present on sub-screens) OR Brand Logo */}
            {title ? (
              <h1 className="text-base sm:text-lg font-bold text-neutral-900 truncate max-w-[180px] sm:max-w-xs">
                {title}
              </h1>
            ) : (
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 text-brand-500 hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl p-1 min-h-[44px]"
                aria-label={t("common.appName", "سوقي")}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-soft-sm shrink-0">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-brand-500 leading-tight">
                    {locale === "ar" ? "سوقي" : "Souqi"}
                  </span>
                  <span className="text-[10px] font-medium text-neutral-500 leading-none -mt-0.5 hidden xs:inline">
                    {locale === "ar" ? "سوق محلي" : "Local Market"}
                  </span>
                </div>
              </Link>
            )}

            {/* Desktop Navigation Links (>=768px / md:) */}
            <nav
              aria-label="Desktop Navigation"
              className="hidden md:flex items-center gap-1 ms-4 lg:ms-6"
            >
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = item.matchExact
                  ? pathname === item.href || pathname === `${item.href}/`
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-150 min-h-[40px]",
                      isActive
                        ? "bg-brand-50 text-brand-600 shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-brand-500" : "text-neutral-400")} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-brand-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* =========================================================================
              2. CENTER SECTION: Neighborhood Selector Chip (Fluid responsive)
             ========================================================================= */}
          {!title && showNeighborhood ? (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={onSelectNeighborhood}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-pill bg-neutral-100/90 hover:bg-neutral-200/70 border border-neutral-200/60 text-xs font-semibold text-neutral-800 transition-all max-w-[120px] sm:max-w-[180px] truncate active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 min-h-[36px]"
                aria-label={`${t("header.location", "الموقع")}: ${district}`}
              >
                <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="truncate">{district}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
              </button>
            </div>
          ) : null}

          {/* =========================================================================
              3. TRAILING SECTION: Search, Cart, Notifications, Language, Profile
             ========================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {rightAction ? (
              rightAction
            ) : (
              <>
                {/* Desktop Quick Search Trigger */}
                <Link
                  href={`/${locale}/catalog`}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-500 hover:text-neutral-800 text-xs transition-colors min-h-[38px]"
                  aria-label={t("catalog.searchPlaceholder", "البحث في السوق")}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{locale === "ar" ? "ابحث في المنتجات..." : "Search items..."}</span>
                </Link>

                {/* Cart Action Button (Responsive with live badge count & 44x44px touch target) */}
                <Link
                  href={`/${locale}/cart`}
                  className="relative flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={t("nav.cart", "سلة المشتريات")}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in-50">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Notification Bell with 44x44px touch target */}
                <Link
                  href={`/${locale}/notifications`}
                  className="relative flex items-center justify-center min-w-[44px] min-h-[44px] text-neutral-700 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`${t("header.notifications", "الإشعارات")}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications && (
                    <span className="absolute top-2 end-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500 ring-2 ring-white" />
                    </span>
                  )}
                </Link>

                {/* Language Toggle */}
                <LanguageToggle variant="pill" />

                {/* Desktop User Profile Link */}
                <Link
                  href={`/${locale}/profile`}
                  className="hidden md:flex items-center justify-center min-w-[40px] min-h-[40px] rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 transition-colors ms-1"
                  aria-label={t("nav.profile", "الملف الشخصي")}
                >
                  <User className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          4. MOBILE DRAWER NAVIGATION (<768px screen drawer)
         ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div
            className={cn(
              "relative w-[82%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 transition-transform animate-in duration-200",
              direction === "rtl" ? "slide-in-from-right" : "slide-in-from-left"
            )}
          >
            {/* Drawer Header */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <Link
                  href={`/${locale}`}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-soft-sm">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-brand-500 leading-tight">
                      {locale === "ar" ? "سوقي" : "Souqi"}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {locale === "ar" ? "سوق محلي أصيل" : "Artisan Marketplace"}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition-all"
                  aria-label={t("common.close", "إغلاق")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Drawer Navigation Links */}
              <nav className="flex flex-col gap-1.5" aria-label="Mobile Drawer Navigation">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.matchExact
                    ? pathname === item.href || pathname === `${item.href}/`
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px]",
                        isActive
                          ? "bg-brand-50 text-brand-600 shadow-xs"
                          : "text-neutral-700 hover:bg-neutral-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-5 h-5", isActive ? "text-brand-500" : "text-neutral-500")} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Additional mobile links: Notifications, Cart & Profile */}
                <Link
                  href={`/${locale}/notifications`}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold text-neutral-700 hover:bg-neutral-100 min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-neutral-500" />
                    <span>{t("nav.notifications", "الإشعارات")}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-brand-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  href={`/${locale}/cart`}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold text-neutral-700 hover:bg-neutral-100 min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-neutral-500" />
                    <span>{t("nav.cart", "سلة المشتريات")}</span>
                  </div>
                  {cartItemCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-brand-500 text-white rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                <Link
                  href={`/${locale}/profile`}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold text-neutral-700 hover:bg-neutral-100 min-h-[48px]"
                >
                  <User className="w-5 h-5 text-neutral-500" />
                  <span>{t("nav.profile", "حسابي الشخصي")}</span>
                </Link>
              </nav>
            </div>

            {/* Drawer Footer: Language Toggle & Version info */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3 pb-safe">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">
                  {locale === "ar" ? "اللغة:" : "Language:"}
                </span>
                <LanguageToggle variant="pill" />
              </div>
              <p className="text-[10px] text-neutral-400 text-center">
                Souqi Marketplace v1.0.0 • {locale === "ar" ? "صنع بحب" : "Crafted with care"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AppHeader;

