"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  Package,
  User,
} from "lucide-react";

interface BottomNavProps {
  cartCount?: number;
  className?: string;
}

/**
 * BottomNav provides the primary docked mobile navigation bar for Souqi Marketplace.
 * Displays 5 tabs: Home, Catalog, Cart (with counter badge), Orders, and Profile.
 */
export function BottomNav({ cartCount, className }: BottomNavProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const cartContext = useCart();
  const pathname = usePathname() || `/${locale}`;
  const effectiveCartCount = cartCount !== undefined ? cartCount : (cartContext?.itemCount ?? 0);

  const navItems = [
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
      label: t("nav.cart", "السلة"),
      href: `/${locale}/cart`,
      icon: ShoppingCart,
      matchExact: false,
      badge: effectiveCartCount,
    },
    {
      label: t("nav.orders", "طلباتي"),
      href: `/${locale}/orders`,
      icon: Package,
      matchExact: false,
    },
    {
      label: t("nav.profile", "حسابي"),
      href: `/${locale}/profile`,
      icon: User,
      matchExact: false,
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label={t("nav.home", "التنقل السفلي")}
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 mx-auto w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-neutral-200/90 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 transition-all shadow-[0_-4px_16px_rgba(0,0,0,0.03)]",
        className
      )}
    >
      <div className="grid grid-cols-5 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchExact
            ? pathname === item.href || pathname === `${item.href}/`
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 min-h-[48px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive
                  ? "text-brand-500 font-semibold"
                  : "text-neutral-500 hover:text-neutral-800"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110 stroke-[2.3px]"
                  )}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -end-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in-50 duration-200"
                    )}
                    aria-label={`${item.badge} items`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] leading-tight mt-1 truncate max-w-full text-center",
                  isActive ? "font-bold text-brand-600" : "font-normal"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-brand-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
