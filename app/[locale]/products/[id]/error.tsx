"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/context/LocaleContext";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale, t } = useLocale();

  useEffect(() => {
    console.error("Product detail page error:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center max-w-md sm:max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-semantic-error flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 font-cairo">
        {t("common.error", "حدث خطأ أثناء تحميل المنتج")}
      </h2>
      <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-xs sm:max-w-sm leading-relaxed font-sans">
        {locale === "ar"
          ? "تعذر الاتصال بالخادم لتحميل تفاصيل هذا المنتج. يرجى المحاولة مرة أخرى."
          : "Unable to load details for this product. Please try again."}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={reset}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          className="min-h-[44px] px-5 font-bold"
        >
          {t("common.retry", "إعادة المحاولة")}
        </Button>
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex items-center px-4 py-2.5 min-h-[44px] rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 text-xs sm:text-sm font-bold transition-all"
        >
          {t("nav.catalog", "العودة للسوق")}
        </Link>
      </div>
    </div>
  );
}
