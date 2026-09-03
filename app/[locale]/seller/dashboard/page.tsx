"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Plus, Sparkles, Store, TrendingUp, Package } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { SellerStatTiles } from "@/components/seller/SellerStatTiles";
import { ProductManagementTable } from "@/components/seller/ProductManagementTable";
import { AiAssistantPanel } from "@/components/seller/AiAssistantPanel";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { MOCK_PRODUCTS } from "@/lib/mock/products";
import type { Product } from "@/types/catalog";

export default function SellerDashboardPage() {
  const { locale, direction } = useLocale();
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  return (
    <div className="w-full max-w-[1700px] 2xl:max-w-[1920px] mx-auto pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Dashboard Top Header */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 xl:px-12 py-3.5 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}`}
            className="min-w-[40px] min-h-[40px] rounded-xl text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Back to Home"
          >
            {direction === "rtl" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-brand-500" />
              <h1 className="text-base sm:text-xl font-bold text-neutral-900">
                {locale === "ar" ? "لوحة تحكم التاجر" : "Seller Dashboard"}
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500">
              {locale === "ar" ? "مشغل الياسمين • فرع رام الله" : "Al-Yasmeen Studio • Ramallah"}
            </p>
          </div>
        </div>

        <Link href={`/${locale}/catalog`}>
          <Button variant="secondary" size="sm" className="min-h-[40px] sm:min-h-[44px] font-bold">
            {locale === "ar" ? "معاينة المتجر" : "Preview Store"}
          </Button>
        </Link>
      </div>

      <div className="px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 flex flex-col gap-5 sm:gap-6">
        {/* KPI Stat Tiles (4 Tiles) */}
        <SellerStatTiles />

        {/* Dashboard Navigation Tabs */}
        <Tabs
          items={[
            {
              id: "inventory",
              label: locale === "ar" ? "إدارة المنتجات" : "Products",
              icon: <Package className="w-4 h-4" />,
            },
            {
              id: "ai_assistant",
              label: locale === "ar" ? "مساعد الذكاء الاصطناعي" : "AI Assistant",
              icon: <Sparkles className="w-4 h-4" />,
            },
          ]}
          value={activeTab}
          onChange={(tab) => setActiveTab(tab)}
        />

        {/* Tab Content */}
        {activeTab === "inventory" && (
          <ProductManagementTable
            products={products}
            onUpdateProducts={(updated) => setProducts(updated)}
            onOpenAiAssistant={() => setActiveTab("ai_assistant")}
          />
        )}

        {activeTab === "ai_assistant" && (
          <AiAssistantPanel
            initialProduct={products[0]}
            onApplySuggestion={({ description, tags }) => {
              setProducts((prev) =>
                prev.map((p, idx) =>
                  idx === 0 ? { ...p, description, tags } : p
                )
              );
              setActiveTab("inventory");
            }}
          />
        )}
      </div>
    </div>
  );
}
