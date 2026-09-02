"use client";

import React from "react";
import { UserProfileHeader } from "@/components/profile/UserProfileHeader";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { useAuth } from "@/lib/context/AuthContext";
import { useLocale } from "@/lib/context/LocaleContext";

export default function ProfilePage() {
  const { locale } = useLocale();
  const { user } = useAuth();

  return (
    <div className="w-full pb-24 animate-in fade-in duration-200">
      {/* Header Profile Section */}
      <UserProfileHeader />

      {/* Account Settings, Loyalty & Management List */}
      <div className="p-4">
        <AccountSettings />
      </div>
    </div>
  );
}
