"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfileHeader } from "@/components/profile/UserProfileHeader";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { useAuth } from "@/lib/context/AuthContext";
import { useLocale } from "@/lib/context/LocaleContext";

export default function ProfilePage() {
  const { locale } = useLocale();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/${locale}/login`);
    }
  }, [isLoading, user, locale, router]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 pb-24 md:pb-12 space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header Profile Section */}
      <UserProfileHeader />

      {/* Account Settings */}
      <AccountSettings />
    </div>
  );
}
