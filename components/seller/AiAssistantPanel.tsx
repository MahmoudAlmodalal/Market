"use client";

import React, { useState } from "react";
import { useLocale } from "@/lib/context/LocaleContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import {
  Sparkles,
  Check,
  X,
  RotateCcw,
  Copy,
  Tag,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export interface AiAssistantPanelProps {
  initialProduct?: Product | null;
  onApplySuggestion?: (suggestion: {
    description: string;
    tags: string[];
  }) => void;
  onClose?: () => void;
  className?: string;
}

interface AiSuggestionResult {
  confidenceScore: number;
  descriptionAr: string;
  descriptionEn: string;
  tags: string[];
  sellingPoints: string[];
}

export function AiAssistantPanel({
  initialProduct,
  onApplySuggestion,
  onClose,
  className,
}: AiAssistantPanelProps) {
  const { locale } = useLocale();

  const [productTitle, setProductTitle] = useState(initialProduct?.name || "");
  const [productCategory, setProductCategory] = useState(
    initialProduct?.category?.name || "عناية وصابون"
  );
  const [keyNotes, setKeyNotes] = useState(
    initialProduct?.tags?.join(", ") || ""
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<AiSuggestionResult | null>(
    initialProduct
      ? {
          confidenceScore: 96,
          descriptionAr: `منتج أصيل وفاخر مُعد يدوياً بعناية فائقة من أجود المكونات الطبيعية والبلدية. يتميز بتركيبة نقية تمنحك أفضل نتائج العناية مع عبير أصيل يعكس التراث والجودة العالية. خالي تماماً من المواد الحافظة الكيميائية.`,
          descriptionEn: `Handcrafted premium artisan product made from 100% pure organic and locally sourced natural ingredients. Delivers authentic quality and natural wellness without harmful chemical additives.`,
          tags: ["طبيعي_100%", "صناعة_يدوية", "بلدي", "عضوي", "عناية_طبيعية"],
          sellingPoints: [
            "خالي من المواد الكيميائية والمواد الحافظة",
            "مُصنع محلياً بأيدي حرفيين مهرة",
            "مناسب لجميع الاستخدامات ومضمون الجودة",
          ],
        }
      : null
  );

  const [copied, setCopied] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Generate realistic AI copy based on input
  const handleGenerate = async () => {
    if (!productTitle.trim()) return;
    setIsGenerating(true);
    setAccepted(false);

    // Simulate AI model inference latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const keywords = keyNotes
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const generatedAr = `نقدم لكم ${productTitle.trim()} الفاخر من تشكيلة ${productCategory}، محضر ومصنوع بعناية فائقة لضمان أعلى مستويات الجودة والأصالة. يتميز بتركيبة فريدة تلبي تطلعات عشاق المنتجات البلدية الطبيعية الأصيلة.`;
    const generatedEn = `Premium ${productTitle.trim()} crafted with highest artisan standards. Delivers authentic local quality and superior care for everyday wellness.`;

    const generatedTags = [
      ...keywords.map((k) => k.replace(/\s+/g, "_")),
      "أصلي",
      "جودة_عالية",
      "طبيعي",
      "سوقي_المحلي",
    ].slice(0, 6);

    setSuggestion({
      confidenceScore: Math.floor(Math.random() * 5) + 94, // 94% - 98%
      descriptionAr: generatedAr,
      descriptionEn: generatedEn,
      tags: generatedTags,
      sellingPoints: [
        "جودة ممتازة معتمدة محلياً",
        "مكونات نقية وطبيعية 100%",
        "تغليف محكم يحافظ على الخصائص الطبيعية",
      ],
    });

    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!suggestion || typeof navigator === "undefined" || !navigator.clipboard)
      return;
    const textToCopy = `${suggestion.descriptionAr}\n\nالوسوم: ${suggestion.tags.join(
      ", "
    )}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccept = () => {
    if (!suggestion) return;
    setAccepted(true);
    if (onApplySuggestion) {
      onApplySuggestion({
        description:
          locale === "ar"
            ? suggestion.descriptionAr
            : suggestion.descriptionEn,
        tags: suggestion.tags,
      });
    }
  };

  return (
    <div
      className={cn(
        "bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-sm space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900">
              {locale === "ar"
                ? "مساعد سوقي الذكي لكتابة الأوصاف"
                : "Souqi AI Copy & Tag Assistant"}
            </h3>
            <p className="text-[10px] text-neutral-500">
              {locale === "ar"
                ? "توليد وصف جذاب ووسوم بحثية ذكية بضغطة واحدة"
                : "Generate compelling bilingual copy & SEO tags"}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input Prompts */}
      <div className="space-y-2.5">
        <Input
          label={locale === "ar" ? "اسم أو عنوان المنتج" : "Product Title"}
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
          placeholder={
            locale === "ar"
              ? "مثال: صابون زيت زيتون بلدي باللافندر"
              : "e.g. Artisan Olive Oil Lavender Soap"
          }
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label={locale === "ar" ? "القسم" : "Category"}
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            placeholder={locale === "ar" ? "عناية وصابون" : "Care"}
          />
          <Input
            label={
              locale === "ar" ? "نقاط القوة / الكلمات المفتاحية" : "Key Highlights"
            }
            value={keyNotes}
            onChange={(e) => setKeyNotes(e.target.value)}
            placeholder={locale === "ar" ? "عضوي, معتق, بدون عطور" : "Organic, aged"}
          />
        </div>

        <Button
          type="button"
          variant="brand"
          className="w-full font-bold bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-700 hover:to-amber-700 text-white shadow-xs"
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={!productTitle.trim() || isGenerating}
        >
          <Sparkles className="w-4 h-4 me-1.5" />
          {locale === "ar"
            ? isGenerating
              ? "جاري التوليد بالذكاء الاصطناعي..."
              : "توليد الوصف والوسوم الذكية"
            : isGenerating
            ? "Generating with AI..."
            : "Generate AI Description & Tags"}
        </Button>
      </div>

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-2.5 animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/3" />
          <div className="h-12 bg-neutral-200 rounded w-full" />
          <div className="flex gap-2">
            <div className="h-6 bg-neutral-200 rounded w-16" />
            <div className="h-6 bg-neutral-200 rounded w-16" />
            <div className="h-6 bg-neutral-200 rounded w-16" />
          </div>
        </div>
      )}

      {/* AI Suggestion Output Result */}
      {!isGenerating && suggestion && (
        <div className="p-3.5 rounded-xl border border-brand-200/80 bg-gradient-to-b from-brand-50/30 to-amber-50/20 space-y-3">
          {/* Confidence Score & Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Badge variant="brand" size="sm" className="font-bold">
                <ShieldCheck className="w-3 h-3 me-1" />
                {suggestion.confidenceScore}%{" "}
                {locale === "ar" ? "نسبة التوافق والجاذبية" : "Match Confidence"}
              </Badge>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-brand-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">
                    {locale === "ar" ? "تم النسخ" : "Copied"}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{locale === "ar" ? "نسخ النص" : "Copy"}</span>
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-neutral-700 block">
              {locale === "ar" ? "الوصف التسويقي المقترح:" : "Suggested Marketing Copy:"}
            </span>
            <p className="text-xs text-neutral-800 leading-relaxed bg-white p-2.5 rounded-lg border border-neutral-200/70">
              {locale === "ar" ? suggestion.descriptionAr : suggestion.descriptionEn}
            </p>
          </div>

          {/* Suggested Tags */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-700 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {locale === "ar" ? "الوسوم الذكية للبحث:" : "Suggested SEO Tags:"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestion.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-brand-200 text-brand-700 text-[10px] font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions: Accept & Reject/Dismiss */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-brand-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 me-1" />
              {locale === "ar" ? "إعادة التوليد" : "Regenerate"}
            </Button>

            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleAccept}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {accepted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 me-1" />
                  {locale === "ar" ? "تم التطبيق" : "Applied"}
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 me-1" />
                  {locale === "ar" ? "قبول وتطبيق على المنتج" : "Accept & Apply"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiAssistantPanel;
