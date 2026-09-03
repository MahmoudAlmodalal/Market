import React from "react";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/lib/context/LocaleContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";
import { NotificationProvider } from "@/lib/context/NotificationContext";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Locale } from "@/types/i18n";

import { ToastProvider } from "@/components/ui/Toast";

const VALID_LOCALES: Locale[] = ["ar", "en"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!VALID_LOCALES.includes(rawLocale as Locale)) {
    notFound();
  }

  const locale = rawLocale as Locale;

  return (
    <LocaleProvider initialLocale={locale}>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <ToastProvider>
              <MobileContainer>
                <AppHeader />
                <main className="flex-1 w-full">{children}</main>
                <BottomNav />
              </MobileContainer>
            </ToastProvider>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

