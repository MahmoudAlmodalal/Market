"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, ArrowLeft, Mail, Lock, Store, ShieldCheck } from "lucide-react";
import { useLocale, useTranslation } from "@/lib/context/LocaleContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { locale, direction } = useLocale();
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("sara@souqi.market");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (success) {
        router.push(`/${locale}/profile`);
      } else {
        setError(locale === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid login credentials");
      }
    } catch (err) {
      setError(locale === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "Login error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex flex-col justify-center px-4 py-8 animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 mb-3 shadow-soft-sm">
            <LogIn className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">
            {locale === "ar" ? "تسجيل الدخول إلى سوقي" : "Welcome to Souqi"}
          </h1>
          <p className="text-xs text-neutral-500">
            {locale === "ar"
              ? "سوق الحارة الرقمي للمنتجات الحرفية والمنزلية"
              : "Hyperlocal marketplace for handmade & local goods"}
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-soft-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-semantic-error font-medium text-start">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-start">
              <label className="text-xs font-semibold text-neutral-700">
                {locale === "ar" ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                startIcon={<Mail className="w-4 h-4 text-neutral-400" />}
              />
            </div>

            <div className="flex flex-col gap-1.5 text-start">
              <label className="text-xs font-semibold text-neutral-700">
                {locale === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                startIcon={<Lock className="w-4 h-4 text-neutral-400" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-2"
              rightIcon={direction === "rtl" ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            >
              {locale === "ar" ? "دخول" : "Sign In"}
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col gap-2">
            <span className="text-[11px] text-neutral-400 text-center font-medium">
              {locale === "ar" ? "حسابات تجريبية سريعة" : "Quick Demo Accounts"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("sara@souqi.market");
                  setPassword("password123");
                }}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-98 transition-all"
              >
                {locale === "ar" ? "مشتري (سارة)" : "Customer (Sara)"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("yasmeen@souqi.market");
                  setPassword("password123");
                }}
                className="px-2.5 py-1.5 rounded-lg border border-brand-200 text-[11px] font-semibold text-brand-600 bg-brand-50/50 hover:bg-brand-50 active:scale-98 transition-all"
              >
                {locale === "ar" ? "تاجر (الياسمين)" : "Seller (Yasmeen)"}
              </button>
            </div>
          </div>
        </Card>

        {/* Register Redirection Link */}
        <div className="text-center text-xs text-neutral-500">
          <span>
            {locale === "ar" ? "ليس لديك حساب بعد؟" : "Don't have an account yet?"}{" "}
          </span>
          <Link href={`/${locale}/register`} className="font-bold text-brand-500 hover:underline">
            {locale === "ar" ? "إنشاء حساب جديد" : "Create an Account"}
          </Link>
        </div>
      </div>
    </div>
  );
}
