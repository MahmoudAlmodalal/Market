"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { Story } from "@/types/catalog";
import type { LocalizedStory } from "@/lib/mock/stories";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export interface StoriesStripProps {
  stories: Story[] | LocalizedStory[];
  onSelectStory?: (story: Story) => void;
  className?: string;
}

/**
 * StoriesStrip: Instagram/Snapchat style circular merchant stories strip for
 * spotlighting daily harvest, artisan specials, and merchant video/image snippets.
 */
export function StoriesStrip({
  stories,
  onSelectStory,
  className,
}: StoriesStripProps) {
  const { t } = useTranslation();
  const { direction, locale } = useLocale();
  const isRtl = direction === "rtl";
  const [activeStory, setActiveStory] = useState<(Story | LocalizedStory) | null>(null);

  if (!stories || stories.length === 0) {
    return null;
  }

  const handleStoryClick = (story: Story | LocalizedStory) => {
    setActiveStory(story);
    if (onSelectStory) {
      onSelectStory(story);
    }
  };

  return (
    <div
      className={cn("w-full relative py-1.5", className)}
      role="region"
      aria-label="Merchant Stories"
    >
      <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-3 sm:px-6 lg:px-8 xl:px-12 scroll-smooth">
        {stories.map((story) => {
          const locStory = story as LocalizedStory;
          const hasUnseen = locStory.has_unseen ?? true;
          const avatarUrl = locStory.avatar || story.image;

          return (
            <button
              key={story.id}
              type="button"
              onClick={() => handleStoryClick(story)}
              className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl p-1 transition-transform active:scale-95"
              aria-label={story.title}
            >
              {/* Circular Avatar Ring */}
              <div
                className={cn(
                  "w-[66px] h-[66px] rounded-full p-[2.5px] transition-all duration-300 flex items-center justify-center",
                  hasUnseen
                    ? "bg-gradient-to-tr from-brand-500 via-[#FF6584] to-[#FFA07A] shadow-glow group-hover:scale-105"
                    : "bg-neutral-200"
                )}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt={story.title}
                    className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Title / Merchant Name Label */}
              <span className="text-[11px] font-semibold text-neutral-800 max-w-[70px] truncate text-center leading-tight">
                {story.seller_name || story.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <Modal
          isOpen={!!activeStory}
          onClose={() => setActiveStory(null)}
          className="max-w-[360px] p-0 overflow-hidden bg-neutral-900 border-none rounded-3xl"
        >
          <div className="relative w-full aspect-[9/16] max-h-[75vh] flex flex-col justify-between overflow-hidden bg-neutral-950">
            {/* Background Story Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeStory.image}
              alt={activeStory.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />

            {/* Header with Seller Info & Progress Bar */}
            <div className="relative z-10 p-4 flex flex-col gap-2">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-full animate-[progress_5s_linear]" />
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={(activeStory as LocalizedStory).avatar || activeStory.image}
                      alt={activeStory.seller_name || "Merchant"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xs font-bold text-white leading-tight drop-shadow">
                      {activeStory.seller_name || "تاجر سوقي"}
                    </span>
                    {activeStory.badge && (
                      <span className="text-[10px] text-brand-200 font-medium">
                        {activeStory.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content & CTA */}
            <div className="relative z-10 p-5 flex flex-col gap-3 text-start">
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-white leading-tight drop-shadow">
                  {activeStory.title}
                </h4>
                {activeStory.subtitle && (
                  <p className="text-xs text-neutral-200 drop-shadow">
                    {activeStory.subtitle}
                  </p>
                )}
              </div>

              {activeStory.link && (
                <Link
                  href={`/${locale}${activeStory.link.startsWith("/") ? activeStory.link : `/${activeStory.link}`}`}
                  onClick={() => setActiveStory(null)}
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    rightIcon={isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  >
                    {t("common.viewDetails", "عرض التفاصيل")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default StoriesStrip;
