"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Locale, Direction, LocaleContextValue } from "@/types/i18n";
import { getDictionary, resolveTranslationKey, interpolate } from "@/lib/i18n/dictionaries";

export interface ExtendedLocaleContextValue extends LocaleContextValue {
  t: (
    key: string,
    paramsOrFallback?: Record<string, string | number> | string,
    fallback?: string
  ) => string;
}

const LocaleContext = createContext<ExtendedLocaleContextValue | null>(null);

interface LocaleProviderProps {
  initialLocale?: Locale;
  children: ReactNode;
}

export function LocaleProvider({
  initialLocale = "ar",
  children,
}: LocaleProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active locale from pathname or initialLocale
  const locale: Locale = useMemo(() => {
    if (pathname) {
      const segments = pathname.split("/").filter(Boolean);
      if (segments[0] === "en") return "en";
      if (segments[0] === "ar") return "ar";
    }
    return initialLocale === "en" ? "en" : "ar";
  }, [pathname, initialLocale]);

  const direction: Direction = locale === "ar" ? "rtl" : "ltr";
  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  // Synchronize document direction and lang attributes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
    }
  }, [locale, direction]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return;

      if (!pathname) {
        router.push(`/${newLocale}`);
        return;
      }

      const segments = pathname.split("/").filter(Boolean);
      if (segments.length === 0) {
        router.push(`/${newLocale}`);
        return;
      }

      if (segments[0] === "ar" || segments[0] === "en") {
        segments[0] = newLocale;
      } else {
        segments.unshift(newLocale);
      }

      const newPath = `/${segments.join("/")}`;
      router.push(newPath);
    },
    [locale, pathname, router]
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === "ar" ? "en" : "ar");
  }, [locale, setLocale]);

  const t = useCallback(
    (
      key: string,
      paramsOrFallback?: Record<string, string | number> | string,
      fallback?: string
    ): string => {
      let params: Record<string, string | number> | undefined;
      let resolvedFallback: string | undefined;

      if (typeof paramsOrFallback === "string") {
        resolvedFallback = paramsOrFallback;
      } else if (typeof paramsOrFallback === "object") {
        params = paramsOrFallback;
        resolvedFallback = fallback;
      } else {
        resolvedFallback = fallback;
      }

      const raw = resolveTranslationKey(dictionary, key, resolvedFallback);
      return interpolate(raw, params);
    },
    [dictionary]
  );

  const value = useMemo<ExtendedLocaleContextValue>(
    () => ({
      locale,
      direction,
      isRtl: direction === "rtl",
      isLtr: direction === "ltr",
      t,
      setLocale,
      toggleLocale,
    }),
    [locale, direction, t, setLocale, toggleLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): ExtendedLocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, locale, direction } = useLocale();
  return { t, locale, direction };
}
