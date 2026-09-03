"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/context/LocaleContext";

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale, t } = useLocale();

  useEffect(() => {
    console.error("Catalog page error:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="flex flex-col items-center gap-4 bg-white rounded-2xl border border-neutral-200/90 p-8 shadow-soft">
        <div className="w-14 h-14 rounded-full bg-red-50 text-semantic-error flex items-center justify-center shadow-soft-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-neutral-900 font-cairo">
            {t("common.error", "حدث خطأ أثناء تحميل الكتالوج")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-sans">
            {locale === "ar"
              ? "تعذر الاتصال بالخادم لتحميل قائمة المنتجات. يرجى إعادة المحاولة."
              : "Unable to load the catalog from the server. Please try again."}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={reset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="min-h-[44px] px-6 font-bold"
        >
          {t("common.retry", "إعادة المحاولة")}
        </Button>
      </div>
    </div>
  );
}
