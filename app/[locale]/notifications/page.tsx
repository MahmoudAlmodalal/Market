"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Package,
  Truck,
  Tag,
  Award,
  CheckCheck,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Check,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useLocale, useTranslation } from "@/lib/context/LocaleContext";
import { useNotifications } from "@/lib/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationCategory } from "@/types";

export default function NotificationsPage() {
  const { locale, direction } = useLocale();
  const { t } = useTranslation();
  const router = useRouter();
  const isRtl = direction === "rtl";

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextChevron = isRtl ? ChevronLeft : ChevronRight;

  // Relative time formatter
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 5) {
        return t("notificationsPage.justNow", "الآن");
      }
      if (diffMins < 60) {
        return locale === "ar"
          ? `منذ ${diffMins} دقيقة`
          : `${diffMins}m ago`;
      }
      if (diffHours < 24) {
        return locale === "ar"
          ? `منذ ${diffHours} ساعة`
          : `${diffHours}h ago`;
      }
      return locale === "ar"
        ? `منذ ${diffDays} يوم`
        : `${diffDays}d ago`;
    } catch {
      return isoString;
    }
  };

  // Counts for tabs
  const orderCount = useMemo(
    () => notifications.filter((n) => n.category === "order" || n.category === "delivery").length,
    [notifications]
  );
  const promoCount = useMemo(
    () => notifications.filter((n) => n.category === "promo").length,
    [notifications]
  );
  const systemCount = useMemo(
    () => notifications.filter((n) => n.category === "system").length,
    [notifications]
  );

  const tabItems: TabItem[] = [
    {
      id: "all",
      label: t("notificationsPage.tabAll", "الكل"),
      count: notifications.length,
    },
    {
      id: "orders",
      label: t("notificationsPage.tabOrders", "الطلبات"),
      count: orderCount,
    },
    {
      id: "promos",
      label: t("notificationsPage.tabPromos", "العروض"),
      count: promoCount,
    },
    {
      id: "system",
      label: t("notificationsPage.tabSystem", "النظام والولاء"),
      count: systemCount,
    },
  ];

  // Filter notifications based on tab and unread status
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === "orders" && item.category !== "order" && item.category !== "delivery") {
        return false;
      }
      if (activeTab === "promos" && item.category !== "promo") {
        return false;
      }
      if (activeTab === "system" && item.category !== "system") {
        return false;
      }

      // Unread only toggle
      if (unreadOnly && item.read) {
        return false;
      }

      return true;
    });
  }, [notifications, activeTab, unreadOnly]);

  // Icon & styling resolver by notification category
  const getCategoryDetails = (category: NotificationCategory) => {
    switch (category) {
      case "order":
        return {
          icon: Package,
          label: locale === "ar" ? "تحديث طلب" : "Order Update",
          badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
          iconBg: "bg-blue-100/70 text-blue-600",
        };
      case "delivery":
        return {
          icon: Truck,
          label: locale === "ar" ? "شحن وتوصيل" : "Delivery",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          iconBg: "bg-emerald-100/70 text-emerald-600",
        };
      case "promo":
        return {
          icon: Tag,
          label: locale === "ar" ? "عرض حصري" : "Special Offer",
          badgeClass: "bg-brand-50 text-brand-700 border-brand-200/80",
          iconBg: "bg-brand-100/70 text-brand-600",
        };
      case "system":
        return {
          icon: Award,
          label: locale === "ar" ? "حسابي والولاء" : "Loyalty & Account",
          badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
          iconBg: "bg-purple-100/70 text-purple-600",
        };
    }
  };

  const handleClearAllConfirm = () => {
    clearAll();
    setIsClearModalOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Sticky Header */}
      <header className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-3.5 border-b border-neutral-100">
        <div className="flex items-center justify-between gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="min-w-[40px] min-h-[40px] rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={locale === "ar" ? "رجوع" : "Go back"}
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-neutral-900">
                  {t("notificationsPage.title", "مركز الإشعارات")}
                </h1>
                {unreadCount > 0 ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                    {t("notificationsPage.unreadCount", `${unreadCount} جديدة`).replace("{count}", String(unreadCount))}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                    {t("notificationsPage.allRead", "جميعها مقروءة")}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                {t("notificationsPage.subtitle", "تنبيهات الطلبات، عروض المتاجر وتحديثات الحساب")}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                leftIcon={<CheckCheck className="w-3.5 h-3.5 text-brand-600" />}
                className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl"
              >
                <span className="hidden sm:inline">
                  {t("notificationsPage.markAllRead", "تحديد الكل كمقروء")}
                </span>
                <span className="sm:hidden">
                  {locale === "ar" ? "قراءة الكل" : "Read all"}
                </span>
              </Button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="min-w-[38px] min-h-[38px] p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={t("notificationsPage.clearAll", "مسح السجل")}
                title={t("notificationsPage.clearAll", "مسح السجل")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs & Unread Filter Row */}
        <div className="mt-3.5 pt-3 border-t border-neutral-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <Tabs
            items={tabItems}
            value={activeTab}
            onChange={setActiveTab}
            variant="pill"
            size="sm"
          />

          {/* Toggle for unread only */}
          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={cn(
              "self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[32px] border",
              unreadOnly
                ? "bg-brand-50 text-brand-600 border-brand-300 font-bold"
                : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                unreadOnly ? "bg-brand-500" : "bg-neutral-300"
              )}
            />
            <span>{t("notificationsPage.unreadOnly", "غير مقروءة فقط")}</span>
          </button>
        </div>
      </header>

      {/* Main Notifications List Container */}
      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-soft-xs">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
              <BellOff className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
              {unreadOnly
                ? locale === "ar"
                  ? "لا توجد إشعارات غير مقروءة"
                  : "No unread notifications"
                : activeTab !== "all"
                ? t("notificationsPage.emptyCategoryTitle", "لا توجد إشعارات في هذا القسم")
                : t("notificationsPage.emptyTitle", "لا توجد إشعارات جديدة")}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
              {unreadOnly
                ? locale === "ar"
                  ? "لقد قمت بقراءة جميع الإشعارات السابقة بنجاح!"
                  : "You've caught up with all your past notifications!"
                : activeTab !== "all"
                ? t("notificationsPage.emptyCategorySubtitle", "لم تتلق أي تنبيهات ضمن هذا التصنيف حتى الآن.")
                : t(
                    "notificationsPage.emptySubtitle",
                    "أنت على اطلاع بكل جديد! ستظهر هنا تحديثات طلباتك والعروض الحصرية فور وصولها."
                  )}
            </p>

            <Link href={`/${locale}/catalog`}>
              <Button
                variant="primary"
                leftIcon={<ShoppingBag className="w-4 h-4" />}
                className="font-bold px-6 py-2.5 rounded-xl shadow-brand-sm"
              >
                {t("notificationsPage.exploreMarket", "تصفح السوق")}
              </Button>
            </Link>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-3">
            {filteredNotifications.map((item) => {
              const categoryDetails = getCategoryDetails(item.category);
              const CategoryIcon = categoryDetails.icon;
              const title = locale === "ar" ? item.title_ar : item.title_en;
              const message = locale === "ar" ? item.message_ar : item.message_en;
              const actionLabel =
                item.action
                  ? locale === "ar"
                    ? item.action.label_ar
                    : item.action.label_en
                  : undefined;
              const actionHref = item.link ? `/${locale}${item.link}` : undefined;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200",
                    item.read
                      ? "bg-white/80 hover:bg-white border-neutral-200/80 shadow-soft-xs"
                      : "bg-white border-brand-200/90 shadow-soft-sm ring-1 ring-brand-100/50"
                  )}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Category Icon Badge */}
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                        categoryDetails.iconBg
                      )}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border",
                              categoryDetails.badgeClass
                            )}
                          >
                            {categoryDetails.label}
                          </span>

                          {/* Relative Time */}
                          <span className="text-[11px] text-neutral-400 font-medium">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>

                        {/* Unread indicator dot */}
                        {!item.read && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-600">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                            <span className="hidden sm:inline">
                              {locale === "ar" ? "جديد" : "New"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title & Message */}
                      <h3
                        className={cn(
                          "text-sm sm:text-base leading-snug mb-1",
                          item.read
                            ? "font-semibold text-neutral-800"
                            : "font-bold text-neutral-900"
                        )}
                      >
                        {title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {message}
                      </p>

                      {/* Metadata Chips if applicable */}
                      {item.metadata?.storeName && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 bg-neutral-100/80 px-2 py-0.5 rounded-md">
                          <span>{item.metadata.storeName}</span>
                        </div>
                      )}

                      {item.metadata?.discountCode && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          <span>{item.metadata.discountCode}</span>
                        </div>
                      )}

                      {/* Bottom Actions Row */}
                      <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                        {/* Primary Action link if present */}
                        {actionHref ? (
                          <Link
                            href={actionHref}
                            onClick={() => {
                              if (!item.read) markAsRead(item.id);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
                          >
                            <span>{actionLabel || t("notificationsPage.viewOrder", "التفاصيل")}</span>
                            <NextChevron className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <div />
                        )}

                        {/* Individual Item Actions */}
                        <div className="flex items-center gap-1 ms-auto">
                          {item.read ? (
                            <button
                              type="button"
                              onClick={() => markAsUnread(item.id)}
                              className="text-[11px] text-neutral-400 hover:text-neutral-700 px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
                              title={t("notificationsPage.markAsUnread", "تحديد كغير مقروء")}
                            >
                              {locale === "ar" ? "تحديد كغير مقروء" : "Mark unread"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markAsRead(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                              title={t("notificationsPage.markAsRead", "تحديد كمقروء")}
                            >
                              <Check className="w-3 h-3" />
                              <span>{locale === "ar" ? "تحديد كمقروء" : "Mark read"}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteNotification(item.id)}
                            className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            aria-label={t("notificationsPage.delete", "حذف")}
                            title={t("notificationsPage.delete", "حذف")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title={t("notificationsPage.clearAll", "مسح السجل")}
        size="sm"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-neutral-600 leading-relaxed">
            {t(
              "notificationsPage.clearConfirm",
              "هل أنت متأكد من مسح جميع الإشعارات؟ لن تتمكن من استرجاعها بعد الحذف."
            )}
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearModalOpen(false)}
            >
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAllConfirm}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              {locale === "ar" ? "تأكيد المسح" : "Confirm Clear"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
