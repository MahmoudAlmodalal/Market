"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, ArrowLeft, Mail, Lock } from "lucide-react";
import { useLocale, useTranslation } from "@/lib/context/LocaleContext";
import { useAuth } from "@/lib/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { locale, direction } = useLocale();
  const { t } = useTranslation();
  const { user, isLoading: authLoading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("omar@souqi.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(`/${locale}/profile`);
    }
  }, [authLoading, user, locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push(`/${locale}/profile`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "invalid_credentials") {
          setError(
            locale === "ar"
              ? "بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور."
              : "Invalid email or password."
          );
        } else if (err.code === "account_suspended") {
          setError(
            locale === "ar"
              ? "هذا الحساب معلق. يرجى التواصل مع إدارة المنصة."
              : "This account has been suspended. Please contact support."
          );
        } else {
          setError(
            err.message ||
              (locale === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "Login error occurred")
          );
        }
      } else {
        setError(
          locale === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "Login error occurred"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex flex-col justify-center px-4 py-8 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col gap-6">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 mb-3 shadow-soft-sm">
            <LogIn className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-1">
            {locale === "ar" ? "تسجيل الدخول إلى سوقي" : "Welcome to Souqi"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {locale === "ar"
              ? "سوق الحارة الرقمي للمنتجات الحرفية والمنزلية"
              : "Hyperlocal marketplace for handmade & local goods"}
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-5 sm:p-6 bg-white border border-neutral-200/90 rounded-2xl shadow-soft-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-semantic-error font-medium text-start">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-start">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700">
                {locale === "ar" ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                startIcon={<Mail className="w-4 h-4 text-neutral-400" />}
                className="h-11 sm:h-12 text-xs sm:text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-start">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700">
                {locale === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                startIcon={<Lock className="w-4 h-4 text-neutral-400" />}
                className="h-11 sm:h-12 text-xs sm:text-sm"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-2 min-h-[44px] font-bold text-sm sm:text-base"
              rightIcon={
                direction === "rtl" ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )
              }
            >
              {locale === "ar" ? "دخول" : "Sign In"}
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col gap-2">
            <span className="text-[11px] sm:text-xs text-neutral-400 text-center font-medium">
              {locale === "ar" ? "حسابات تجريبية سريعة" : "Quick Demo Accounts"}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("omar@souqi.com");
                  setPassword("password123");
                }}
                className="px-2 py-2 min-h-[44px] rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-98 transition-all flex items-center justify-center text-center"
              >
                {locale === "ar" ? "مشتري (عمر)" : "Customer (Omar)"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("sara@souqi.com");
                  setPassword("password123");
                }}
                className="px-2 py-2 min-h-[44px] rounded-xl border border-brand-200 text-xs font-semibold text-brand-600 bg-brand-50/50 hover:bg-brand-50 active:scale-98 transition-all flex items-center justify-center text-center"
              >
                {locale === "ar" ? "تاجر (سارة)" : "Seller (Sara)"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@souqi.com");
                  setPassword("password123");
                }}
                className="px-2 py-2 min-h-[44px] rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-98 transition-all flex items-center justify-center text-center"
              >
                {locale === "ar" ? "مدير (Admin)" : "Admin"}
              </button>
            </div>
          </div>
        </Card>

        {/* Register Redirection Link */}
        <div className="text-center text-xs text-neutral-500">
          <span>
            {locale === "ar" ? "ليس لديك حساب بعد؟" : "Don't have an account yet?"}{" "}
          </span>
          <Link
            href={`/${locale}/register`}
            className="font-bold text-brand-500 hover:underline"
          >
            {locale === "ar" ? "إنشاء حساب جديد" : "Create an Account"}
          </Link>
        </div>
      </div>
    </div>
  );
}
