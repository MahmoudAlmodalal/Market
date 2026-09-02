"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  MessageSquare,
  Filter,
  CornerDownLeft,
  CornerDownRight,
  Plus,
  X,
  Check,
} from "lucide-react";
import type { Review } from "@/types/catalog";
import type { ExtendedReview } from "@/lib/mock/sellers";
import { getRatingStats } from "@/lib/mock/sellers";

export interface ReviewListProps {
  reviews?: (Review | ExtendedReview)[];
  productId?: number;
  sellerName?: string;
  className?: string;
}

export function ReviewList({
  reviews = [],
  productId,
  sellerName = "المتجر",
  className,
}: ReviewListProps) {
  const { locale, direction, t } = useLocale();
  const isRtl = direction === "rtl";

  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [helpfulMap, setHelpfulMap] = useState<Record<number, boolean>>({});
  const [helpfulCounts, setHelpfulCounts] = useState<Record<number, number>>({});
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const [localReviews, setLocalReviews] = useState<(Review | ExtendedReview)[]>(reviews);

  // Sync if prop updates
  React.useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const stats = React.useMemo(() => getRatingStats(localReviews), [localReviews]);

  const filteredReviews = React.useMemo(() => {
    if (selectedStarFilter === null) return localReviews;
    return localReviews.filter((r) => Math.round(r.rating) === selectedStarFilter);
  }, [localReviews, selectedStarFilter]);

  const handleHelpfulClick = (reviewId: number, currentCount: number = 0) => {
    const isCurrentlyHelpful = helpfulMap[reviewId] || false;
    const baseCount = helpfulCounts[reviewId] ?? currentCount;

    if (isCurrentlyHelpful) {
      setHelpfulMap((prev) => ({ ...prev, [reviewId]: false }));
      setHelpfulCounts((prev) => ({ ...prev, [reviewId]: Math.max(0, baseCount - 1) }));
    } else {
      setHelpfulMap((prev) => ({ ...prev, [reviewId]: true }));
      setHelpfulCounts((prev) => ({ ...prev, [reviewId]: baseCount + 1 }));
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const addedReview: ExtendedReview = {
      id: Date.now(),
      productId,
      user_name: newName.trim() || (locale === "en" ? "Verified Customer" : "مشتري معتمد"),
      rating: newRating,
      comment: newComment.trim(),
      created_at: new Date().toISOString(),
      is_verified_buyer: true,
      helpful_count: 0,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    };

    setLocalReviews((prev) => [addedReview, ...prev]);
    setIsWriteModalOpen(false);
    setNewComment("");
    setNewName("");
  };

  return (
    <div
      id="product-reviews-section"
      className={cn(
        "w-full bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/90 shadow-soft flex flex-col gap-5",
        className
      )}
    >
      {/* Reviews Header */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-500" />
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 font-cairo">
            {t("pdp.reviews", "تقييمات وآراء المشترين")}
          </h2>
          <span className="text-xs font-semibold text-neutral-500 numeric-data">
            ({localReviews.length})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-bold transition-all border border-brand-200/80 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{locale === "en" ? "Write Review" : "أضف تقييمك"}</span>
        </button>
      </div>

      {/* Rating Breakdown & Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/60">
        {/* Average Score Box */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center text-center p-2 border-b sm:border-b-0 sm:border-e border-neutral-200/60">
          <span className="text-4xl font-extrabold text-neutral-900 numeric-data leading-none">
            {stats.average.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 text-amber-500 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-4 h-4",
                  star <= Math.round(stats.average)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-neutral-200 text-neutral-200"
                )}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-neutral-500 numeric-data">
            {stats.total} {t("pdp.reviews", "تقييمات معتمدة")}
          </span>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="sm:col-span-8 flex flex-col justify-center gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

            return (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setSelectedStarFilter((prev) => (prev === star ? null : star))
                }
                className={cn(
                  "flex items-center gap-2 group text-start py-0.5 px-1.5 rounded-lg transition-colors",
                  selectedStarFilter === star ? "bg-brand-100/60" : "hover:bg-neutral-100"
                )}
              >
                <div className="flex items-center gap-1 text-neutral-600 text-xs font-semibold w-9 shrink-0">
                  <span className="numeric-data">{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2 rounded-full bg-neutral-200/80 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="text-[11px] font-medium text-neutral-500 numeric-data w-6 text-end shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Chips Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedStarFilter(null)}
          className={cn(
            "px-3 py-1 rounded-pill text-xs font-semibold border transition-all shrink-0",
            selectedStarFilter === null
              ? "bg-brand-500 text-white border-brand-500 shadow-2xs"
              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
          )}
        >
          {locale === "en" ? "All Reviews" : "جميع التقييمات"} ({localReviews.length})
        </button>

        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setSelectedStarFilter(star)}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-pill text-xs font-semibold border transition-all shrink-0",
              selectedStarFilter === star
                ? "bg-brand-500 text-white border-brand-500 shadow-2xs"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
            )}
          >
            <span className="numeric-data">{star}</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] opacity-80">({stats.distribution[star] || 0})</span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="flex flex-col divide-y divide-neutral-100">
        {filteredReviews.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-xs">
            {locale === "en"
              ? "No reviews match the selected filter."
              : "لا توجد تقييمات مطابقة للتصفية المختارة."}
          </div>
        ) : (
          filteredReviews.map((review) => {
            const ext = review as ExtendedReview;
            const reviewerName =
              locale === "en" ? ext.user_name_en || review.user_name : review.user_name;
            const isHelpful = helpfulMap[review.id] || false;
            const helpfulCount = helpfulCounts[review.id] ?? (ext.helpful_count || 0);

            return (
              <div key={review.id} className="py-4 flex flex-col gap-3">
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* User Avatar */}
                    <div className="w-9 h-9 rounded-full bg-brand-100/70 border border-brand-200/80 overflow-hidden flex items-center justify-center font-bold text-brand-700 text-xs shrink-0">
                      {ext.avatar ? (
                        <img
                          src={ext.avatar}
                          alt={reviewerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{reviewerName.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900">
                          {reviewerName}
                        </span>

                        {(ext.is_verified_buyer ?? true) && (
                          <span className="inline-flex items-center gap-0.5 text-semantic-success bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-pill text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3 text-semantic-success shrink-0" />
                            <span>{locale === "en" ? "Verified Buyer" : "مشتري موثق"}</span>
                          </span>
                        )}
                      </div>

                      {/* Date */}
                      <span className="text-[10px] text-neutral-400 numeric-data">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString(
                              locale === "en" ? "en-US" : "ar-EG",
                              { year: "numeric", month: "short", day: "numeric" }
                            )
                          : "مؤخراً"}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-3.5 h-3.5",
                          star <= Math.round(review.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-neutral-200 text-neutral-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Comment Body */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed text-start font-sans">
                  {review.comment}
                </p>

                {/* Seller Reply Box */}
                {ext.reply && (
                  <div className="ms-3 sm:ms-5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 text-brand-600 text-xs font-bold">
                      {isRtl ? (
                        <CornerDownLeft className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      ) : (
                        <CornerDownRight className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      )}
                      <span>
                        {locale === "en"
                          ? `Response from ${ext.reply.seller_name || sellerName}`
                          : `رد من ${ext.reply.seller_name || sellerName}`}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed text-start">
                      {ext.reply.comment}
                    </p>
                  </div>
                )}

                {/* Helpfulness Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleHelpfulClick(review.id, ext.helpful_count)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all active:scale-95",
                      isHelpful
                        ? "bg-brand-50 border-brand-200 text-brand-600"
                        : "bg-white border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                    )}
                  >
                    <ThumbsUp
                      className={cn("w-3 h-3 transition-transform", isHelpful && "fill-current scale-110")}
                    />
                    <span>{locale === "en" ? "Helpful" : "مفيد"}</span>
                    {helpfulCount > 0 && (
                      <span className="numeric-data font-bold">({helpfulCount})</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Write Review Modal */}
      {isWriteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="كتابة تقييم جديد"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-soft-xl border border-neutral-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 font-cairo">
                {locale === "en" ? "Write a Customer Review" : "شارك رأيك وتقييمك للمنتج"}
              </h3>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddReview} className="p-4 flex flex-col gap-4">
              {/* Rating Selector */}
              <div className="flex flex-col items-center gap-1.5 py-1">
                <span className="text-xs font-bold text-neutral-700">
                  {locale === "en" ? "Your Rating" : "تقييمك للمنتج"}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 focus:outline-hidden"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6 transition-all active:scale-110",
                          star <= newRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-neutral-200 text-neutral-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700 text-start">
                  {locale === "en" ? "Your Name" : "اسمك"}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={locale === "en" ? "e.g. Sarah K." : "مثال: سارة خليل"}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Comment Textarea */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700 text-start">
                  {locale === "en" ? "Your Feedback" : "رأيك بالتفصيل"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    locale === "en"
                      ? "Share your honest experience with quality, packaging, and delivery..."
                      : "شاركنا تجربتك الصادقة مع الجودة والتغليف وسرعة التوصيل..."
                  }
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  {t("common.cancel", "إلغاء")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-soft active:scale-95 transition-all"
                >
                  {locale === "en" ? "Submit Review" : "إرسال التقييم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewList;
