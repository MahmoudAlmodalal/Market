"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/context/LocaleContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LogoutModal } from "./LogoutModal";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/order";
import {
  MapPin,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  Store,
  User,
  ExternalLink,
  Edit2,
} from "lucide-react";

export interface AccountSettingsProps {
  className?: string;
}

export function AccountSettings({ className }: AccountSettingsProps) {
  const { locale, direction } = useLocale();
  const isRtl = direction === "rtl";
  const {
    user,
    activeRole,
    switchRole,
    savedAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    notificationPreferences,
    updateNotificationPreferences,
  } = useAuth();

  // Modals state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressFormOpen, setIsAddAddressFormOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState<Omit<Address, "id">>({
    name: "",
    street: "",
    neighborhood: "",
    city: "غزة",
    phone: user?.phone || "+970 59-912-3456",
    is_default: false,
    notes: "",
  });

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city) return;
    addAddress(newAddress);
    setNewAddress({
      name: "",
      street: "",
      neighborhood: "",
      city: "غزة",
      phone: user?.phone || "+970 59-912-3456",
      is_default: false,
      notes: "",
    });
    setIsAddAddressFormOpen(false);
  };

  const isSeller = activeRole === "seller" || user?.role === "seller";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Account Settings Header */}
      <h3 className="text-sm font-bold text-neutral-800 px-1">
        {locale === "ar" ? "إعدادات الحساب والتفضيلات" : "Account & Preferences"}
      </h3>

      {/* Settings Action List */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl divide-y divide-neutral-100 shadow-sm overflow-hidden">
        {/* 1. Saved Addresses */}
        <button
          type="button"
          onClick={() => setIsAddressModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-neutral-50/80 transition-colors text-start"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {locale === "ar" ? "العناوين المحفوظة" : "Saved Addresses"}
              </p>
              <p className="text-xs text-neutral-500">
                {locale === "ar"
                  ? `${savedAddresses.length} عناوين مضافة للتوصيل السريع`
                  : `${savedAddresses.length} saved delivery locations`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">
              {savedAddresses.length}
            </Badge>
            {isRtl ? (
              <ChevronLeft className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </div>
        </button>

        {/* 2. Notification Preferences */}
        <button
          type="button"
          onClick={() => setIsNotificationModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-neutral-50/80 transition-colors text-start"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {locale === "ar" ? "إشعارات الطلبات والعروض" : "Notification Preferences"}
              </p>
              <p className="text-xs text-neutral-500">
                {locale === "ar"
                  ? "تنبيهات حالة الطلب والخصومات"
                  : "Order updates, SMS & push notifications"}
              </p>
            </div>
          </div>
          {isRtl ? (
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {/* 3. Role Switcher (Customer / Seller Mode) */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {locale === "ar" ? "وضع التاجر / المتجر" : "Seller Merchant Mode"}
              </p>
              <p className="text-xs text-neutral-500">
                {locale === "ar"
                  ? isSeller
                    ? "أنت حالياً تتصفح كتاجر معتمد"
                    : "تبديل إلى إدارة منتجاتك وطلباتك"
                  : isSeller
                  ? "Active as merchant seller"
                  : "Switch to manage products & orders"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={isSeller ? "outline" : "brand"}
            onClick={() => switchRole(isSeller ? "customer" : "seller")}
          >
            {isSeller
              ? locale === "ar"
                ? "العودة كمشتري"
                : "Customer Mode"
              : locale === "ar"
              ? "دخول التاجر"
              : "Seller Mode"}
          </Button>
        </div>

        {/* 4. Terms of Service */}
        <button
          type="button"
          onClick={() => setIsTermsModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-neutral-50/80 transition-colors text-start"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {locale === "ar" ? "شروط الخدمة والاستخدام" : "Terms of Service"}
              </p>
              <p className="text-xs text-neutral-500">
                {locale === "ar" ? "اتفاقية الاستخدام وحقوق المتسوق" : "Souqi legal and marketplace terms"}
              </p>
            </div>
          </div>
          {isRtl ? (
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {/* 5. Privacy Policy */}
        <button
          type="button"
          onClick={() => setIsPrivacyModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-neutral-50/80 transition-colors text-start"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {locale === "ar" ? "سياسة الخصوصية وأمان البيانات" : "Privacy & Security Policy"}
              </p>
              <p className="text-xs text-neutral-500">
                {locale === "ar" ? "كيف نحمي بياناتك ومعاملاتك" : "Data protection & privacy standards"}
              </p>
            </div>
          </div>
          {isRtl ? (
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {/* 6. Log Out Button */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50/80 transition-colors text-start group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 group-hover:bg-red-200/80 flex items-center justify-center text-red-600">
              <LogOut className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-600">
                {locale === "ar" ? "تسجيل الخروج" : "Log Out"}
              </p>
              <p className="text-xs text-red-400">
                {locale === "ar" ? "إنهاء الجلسة الحالية بأمان" : "Safely end current session"}
              </p>
            </div>
          </div>
          {isRtl ? (
            <ChevronLeft className="w-4 h-4 text-red-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-red-400" />
          )}
        </button>
      </div>

      {/* --- MODALS --- */}

      {/* Saved Addresses Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setIsAddAddressFormOpen(false);
        }}
        title={locale === "ar" ? "العناوين المحفوظة" : "Saved Addresses"}
        size="lg"
      >
        <div className="space-y-4 pt-1">
          {!isAddAddressFormOpen ? (
            <>
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pe-1">
                {savedAddresses.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 text-xs">
                    {locale === "ar" ? "لا توجد عناوين محفوظة بعد" : "No saved addresses yet"}
                  </div>
                ) : (
                  savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={cn(
                        "p-3.5 rounded-xl border transition-all text-start flex items-start justify-between gap-3",
                        addr.is_default
                          ? "border-brand-300 bg-brand-50/40"
                          : "border-neutral-200 hover:border-neutral-300 bg-white"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">
                            {addr.name || (locale === "ar" ? "العنوان" : "Address")}
                          </span>
                          {addr.is_default && (
                            <Badge variant="brand" size="sm">
                              {locale === "ar" ? "الافتراضي" : "Default"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-neutral-700 font-medium">
                          {addr.street} {addr.neighborhood ? `، ${addr.neighborhood}` : ""}، {addr.city}
                        </p>
                        <p className="text-[11px] text-neutral-500 tabular-nums">
                          {addr.phone}
                        </p>
                        {addr.notes && (
                          <p className="text-[11px] text-neutral-400 italic">
                            {addr.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!addr.is_default && addr.id && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-xs text-neutral-600 h-8 px-2"
                            onClick={() => setDefaultAddress(addr.id!)}
                          >
                            {locale === "ar" ? "تعيين كافتراضي" : "Set Default"}
                          </Button>
                        )}
                        {addr.id && (
                          <button
                            type="button"
                            onClick={() => removeAddress(addr.id!)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Button
                type="button"
                variant="brand"
                className="w-full"
                onClick={() => setIsAddAddressFormOpen(true)}
              >
                <Plus className="w-4 h-4 me-1.5" />
                {locale === "ar" ? "إضافة عنوان جديد" : "Add New Address"}
              </Button>
            </>
          ) : (
            <form onSubmit={handleCreateAddress} className="space-y-3">
              <Input
                label={locale === "ar" ? "اسم العنوان (مثال: المنزل، العمل)" : "Address Label (e.g. Home, Work)"}
                value={newAddress.name}
                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                placeholder={locale === "ar" ? "المنزل" : "Home"}
                required
              />
              <Input
                label={locale === "ar" ? "الشارع ورقم المبنى" : "Street & Building"}
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                placeholder={locale === "ar" ? "شارع عمر المختار، عمارة الأمل" : "Main St, Building 4"}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={locale === "ar" ? "الحي / المنطقة" : "Neighborhood"}
                  value={newAddress.neighborhood}
                  onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                  placeholder={locale === "ar" ? "حي الرمال" : "Rimal"}
                />
                <Input
                  label={locale === "ar" ? "المدينة" : "City"}
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder={locale === "ar" ? "غزة" : "Gaza"}
                  required
                />
              </div>
              <Input
                label={locale === "ar" ? "رقم الهاتف للتوصيل" : "Contact Phone"}
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                placeholder="+970 59-912-3456"
                required
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addr_default_check"
                  checked={newAddress.is_default}
                  onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                  className="rounded border-neutral-300 text-brand-500 focus:ring-brand-500 h-4 w-4"
                />
                <label htmlFor="addr_default_check" className="text-xs font-semibold text-neutral-700 cursor-pointer">
                  {locale === "ar" ? "تعيين كعنوان افتراضي رئيسي" : "Set as primary default address"}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddAddressFormOpen(false)}
                >
                  {locale === "ar" ? "رجوع" : "Back"}
                </Button>
                <Button type="submit" variant="brand" size="sm">
                  {locale === "ar" ? "حفظ العنوان" : "Save Address"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title={locale === "ar" ? "تفضيلات الإشعارات" : "Notification Settings"}
        size="md"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-neutral-600">
            {locale === "ar"
              ? "تحكّم في القنوات والتنبيهات التي ترغب باستلامها من سوقي:"
              : "Manage which notifications you receive from Souqi:"}
          </p>

          <div className="space-y-3 bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/80">
            {/* Order Updates */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {locale === "ar" ? "تحديثات حالة الطلب المباشرة" : "Live Order Status Updates"}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {locale === "ar" ? "إشعارات فورية عند قبول وتجهيز وتوصيل طلبك" : "Instant alerts when status changes"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences?.order_updates ?? true}
                onChange={(e) => updateNotificationPreferences({ order_updates: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60">
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {locale === "ar" ? "رسائل SMS النصية" : "SMS Text Messages"}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {locale === "ar" ? "رسائل نصية لرقم هاتفك عند وصول المندوب" : "SMS updates upon courier arrival"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences?.sms_enabled ?? true}
                onChange={(e) => updateNotificationPreferences({ sms_enabled: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60">
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {locale === "ar" ? "إشعارات البريد الإلكتروني والفواتير" : "Email Receipts & Summaries"}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {locale === "ar" ? "نسخة رقمية من فاتورة الشراء وتأكيد الدفع" : "Digital receipts & monthly activity"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences?.email_enabled ?? true}
                onChange={(e) => updateNotificationPreferences({ email_enabled: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            {/* Promotional Offers */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60">
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {locale === "ar" ? "العروض وقسائم الخصم الترويجية" : "Promotions & Discounts"}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {locale === "ar" ? "تنبيهات بالعروض الحصرية من المتاجر المجاورة" : "Deals & seasonal neighborhood specials"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences?.promotional_offers ?? false}
                onChange={(e) => updateNotificationPreferences({ promotional_offers: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={() => setIsNotificationModalOpen(false)}
            >
              {locale === "ar" ? "حفظ التفضيلات" : "Save Preferences"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title={locale === "ar" ? "شروط الخدمة" : "Terms of Service"}
        size="lg"
      >
        <div className="space-y-3 pt-1 text-xs text-neutral-700 leading-relaxed max-h-[350px] overflow-y-auto pe-1">
          <p className="font-bold text-neutral-900 text-sm">
            {locale === "ar" ? "شروط وأحكام منصة سوقي" : "Souqi Marketplace Terms of Service"}
          </p>
          <p>
            {locale === "ar"
              ? "مرحباً بكم في منصة سوقي للتجارة الإلكترونية المحلية. باستخدامك للمنصة، فإنك توافق على الالتزام بكافة الشروط والأحكام الخاصة بالطلب والتوصيل والإلغاء."
              : "Welcome to Souqi Local Marketplace. By using our platform, you agree to comply with our terms regarding ordering, single-seller cart policies, delivery, and cancellations."}
          </p>
          <p className="font-semibold text-neutral-800">
            {locale === "ar" ? "1. سياسة السلة أحادية المتجر" : "1. Single-Seller Cart Policy"}
          </p>
          <p>
            {locale === "ar"
              ? "تعتمد منصة سوقي نموذج الطلب من متجر واحد في كل عملية شراء للحفاظ على سرعة التوصيل وطزاجة المنتجات المحلية."
              : "Souqi enforces a single-seller cart model to guarantee rapid neighborhood delivery and product freshness."}
          </p>
          <p className="font-semibold text-neutral-800">
            {locale === "ar" ? "2. سياسة الإلغاء" : "2. Cancellation Policy"}
          </p>
          <p>
            {locale === "ar"
              ? "يُسمح للعميل بإلغاء الطلب فقط أثناء حالتي (قيد الانتظار) و(تم التأكيد). بمجرد بدء المتجر بتجهيز الطلب، لا يمكن إلغاؤه حفاظاً على حقوق الحرفيين والمتاجر."
              : "Customers may cancel orders exclusively during Pending and Confirmed statuses. Once preparation begins, cancellations are locked."}
          </p>
        </div>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title={locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        size="lg"
      >
        <div className="space-y-3 pt-1 text-xs text-neutral-700 leading-relaxed max-h-[350px] overflow-y-auto pe-1">
          <p className="font-bold text-neutral-900 text-sm">
            {locale === "ar" ? "حماية وخصوصية بيانات المستخدمين" : "User Data Protection & Privacy"}
          </p>
          <p>
            {locale === "ar"
              ? "نحن في سوقي نلتزم بأعلى معايير حماية البيانات الشخصية والعناوين وأرقام الهواتف. لا نقوم بمشاركة أي بيانات مع أطراف ثالثة إلا في حدود التنسيق مع مندوب التوصيل والمتجر المعني بتنفيذ طلبك."
              : "We take your privacy seriously. Your phone number and address are shared strictly with the merchant and delivery courier fulfilling your specific order."}
          </p>
          <p>
            {locale === "ar"
              ? "تُحفظ كافة بيانات المعاملات المالية ومعلومات الدفع وفق بروتوكولات تشفير آمنة."
              : "All payment transactions and order history are secured with end-to-end encryption."}
          </p>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}

export default AccountSettings;
