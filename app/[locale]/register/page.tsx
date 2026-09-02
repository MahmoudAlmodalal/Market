"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight, ArrowLeft, Mail, Lock, User, Phone, Store } from "lucide-react";
import { useLocale, useTranslation } from "@/lib/context/LocaleContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { UserRole } from "@/types/user";

export default function RegisterPage() {
  const { locale, direction } = useLocale();
  const { t } = useTranslation();
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (register) {
        const success = await register({ name, email, phone, role, password });
        if (success) {
          router.push(`/${locale}/profile`);
          return;
        }
      }
      router.push(`/${locale}/profile`);
    } catch (err) {
      setError(locale === "ar" ? "حدث خطأ أثناء إنشاء الحساب" : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center px-4 py-8 animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 mb-3 shadow-soft-sm">
            <UserPlus className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">
            {locale === "ar" ? "إنشاء حساب جديد" : "Create an Account"}
          </h1>
          <p className="text-xs text-neutral-500">
            {locale === "ar"
              ? "انضم لمجتمع سوقي وتسوّق من أفضل منتجي حارتك"
              : "Join Souqi community and support local creators"}
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-soft-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-semantic-error font-medium text-start">
                {error}
              </div>
            )}

            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100/80 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === "customer"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {locale === "ar" ? "مشتري" : "Customer"}
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === "seller"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {locale === "ar" ? "تاجر / صانع" : "Seller / Maker"}
              </button>
            </div>

            <div className="flex flex-col gap-1 text-start">
              <label className="text-xs font-semibold text-neutral-700">
                {locale === "ar" ? "الاسم الكامل" : "Full Name"}
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={locale === "ar" ? "سارة الأحمد" : "Sara Al-Ahmad"}
                startIcon={<User className="w-4 h-4 text-neutral-400" />}
              />
            </div>

            <div className="flex flex-col gap-1 text-start">
              <label className="text-xs font-semibold text-neutral-700">
                {locale === "ar" ? "البريد الإلكتروني" : "Email"}
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sara@example.com"
                startIcon={<Mail className="w-4 h-4 text-neutral-400" />}
              />
            </div>

            <div className="flex flex-col gap-1 text-start">
              <label className="text-xs font-semibold text-neutral-700">
                {locale === "ar" ? "رقم الهاتف" : "Phone Number"}
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+970 59 912 3456"
                startIcon={<Phone className="w-4 h-4 text-neutral-400" />}
              />
            </div>

            <div className="flex flex-col gap-1 text-start">
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
              {locale === "ar" ? "إنشاء الحساب" : "Register"}
            </Button>
          </form>
        </Card>

        {/* Login Redirection Link */}
        <div className="text-center text-xs text-neutral-500">
          <span>
            {locale === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          </span>
          <Link href={`/${locale}/login`} className="font-bold text-brand-500 hover:underline">
            {locale === "ar" ? "تسجيل الدخول" : "Sign In"}
          </Link>
        </div>
      </div>
    </div>
  );
}
