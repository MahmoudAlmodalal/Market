"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/context/LocaleContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LogOut, AlertCircle } from "lucide-react";

export interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const { locale } = useLocale();
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      logout();
      if (onConfirm) {
        onConfirm();
      }
      onClose();
      router.push(`/${locale}/login`);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={locale === "ar" ? "تسجيل الخروج" : "Log Out"}
      size="sm"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200/70 text-red-900">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">
              {locale === "ar"
                ? "تأكيد تسجيل الخروج"
                : "Confirm Sign Out"}
            </h4>
            <p className="text-xs text-red-700 mt-0.5">
              {locale === "ar"
                ? "هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟"
                : "Are you sure you want to log out of your account?"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {locale === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {locale === "ar" ? "تسجيل الخروج" : "Log Out"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default LogoutModal;
