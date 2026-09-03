"use client";

import React, { useState } from "react";
import { useLocale } from "@/lib/context/LocaleContext";
import { Modal } from "@/components/ui/Modal";
import { LogoutModal } from "./LogoutModal";
import { cn } from "@/lib/utils";
import {
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export interface AccountSettingsProps {
  className?: string;
}

export function AccountSettings({ className }: AccountSettingsProps) {
  const { locale, direction } = useLocale();
  const isRtl = direction === "rtl";

  // Modals state
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Account Settings Header */}
      <h3 className="text-sm font-bold text-neutral-800 px-1">
        {locale === "ar" ? "إعدادات الحساب والتفضيلات" : "Account & Preferences"}
      </h3>

      {/* Settings Action List */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl divide-y divide-neutral-100 shadow-sm overflow-hidden">
        {/* 1. Terms of Service */}
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
                {locale === "ar"
                  ? "اتفاقية الاستخدام وحقوق المتسوق"
                  : "Souqi legal and marketplace terms"}
              </p>
            </div>
          </div>
          {isRtl ? (
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {/* 2. Privacy Policy */}
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
                {locale === "ar"
                  ? "كيف نحمي بياناتك ومعاملاتك"
                  : "Data protection & privacy standards"}
              </p>
            </div>
          </div>
          {isRtl ? (
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {/* 3. Log Out Button */}
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
