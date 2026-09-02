"use client";

import React, { useState, useEffect } from "react";
import { MapPin, User, Phone, Building, FileText, Check, AlertCircle } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/order";

export interface NewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  initialAddress?: Address | null;
  className?: string;
}

const POPULAR_CITIES = [
  { ar: "غزة", en: "Gaza" },
  { ar: "رام الله", en: "Ramallah" },
  { ar: "البيرة", en: "Al-Bireh" },
  { ar: "القدس", en: "Jerusalem" },
  { ar: "نابلس", en: "Nablus" },
  { ar: "الخليل", en: "Hebron" },
  { ar: "بيت لحم", en: "Bethlehem" },
  { ar: "جنين", en: "Jenin" },
  { ar: "طولكرم", en: "Tulkarm" },
  { ar: "خانيونس", en: "Khan Younis" },
  { ar: "رفح", en: "Rafah" },
];

/**
 * NewAddressModal enables customers to add a new shipping address
 * or edit an existing address with full field validation and default selection.
 */
export function NewAddressModal({
  isOpen,
  onClose,
  onSave,
  initialAddress,
  className,
}: NewAddressModalProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("رام الله");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAddress) {
      setName(initialAddress.name || "");
      setPhone(initialAddress.phone || "");
      setCity(initialAddress.city || (locale === "ar" ? "رام الله" : "Ramallah"));
      setNeighborhood(initialAddress.neighborhood || "");
      setStreet(initialAddress.street || "");
      setNotes(initialAddress.notes || "");
      setIsDefault(Boolean(initialAddress.is_default));
    } else {
      setName("");
      setPhone("+970 59-");
      setCity(locale === "ar" ? "رام الله" : "Ramallah");
      setNeighborhood("");
      setStreet("");
      setNotes("");
      setIsDefault(false);
    }
    setErrors({});
  }, [initialAddress, isOpen, locale]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!phone.trim() || phone.trim() === "+970 59-") {
      errs.phone = locale === "ar" ? "رقم الهاتف مطلوب للتوصيل" : "Contact phone is required";
    }

    if (!city.trim()) {
      errs.city = locale === "ar" ? "يرجى اختيار المدينة" : "City is required";
    }

    if (!street.trim()) {
      errs.street = locale === "ar" ? "تفاصيل العنوان والشارع مطلوبة" : "Detailed street address is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newAddress: Address = {
      id: initialAddress?.id || Date.now(),
      name: name.trim() || (locale === "ar" ? "عنوان جديد" : "New Address"),
      phone: phone.trim(),
      city: city.trim(),
      neighborhood: neighborhood.trim() || undefined,
      street: street.trim(),
      notes: notes.trim() || undefined,
      is_default: isDefault,
    };

    onSave(newAddress);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-neutral-900 font-bold">
          <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
          <span>
            {initialAddress
              ? locale === "ar"
                ? "تعديل عنوان التوصيل"
                : "Edit Delivery Address"
              : locale === "ar"
              ? "إضافة عنوان جديد"
              : "Add New Address"}
          </span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="text-neutral-700 hover:bg-neutral-100"
          >
            {t("common.cancel", "إلغاء")}
          </Button>

          <Button
            variant="primary"
            type="button"
            onClick={handleSubmit}
            className="font-bold bg-brand-500 hover:bg-brand-600 px-5"
          >
            <Check className="w-4 h-4" />
            <span>{t("common.save", "حفظ العنوان")}</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-3.5 text-start", className)}>
        {/* Label Name (Home/Work) */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            {locale === "ar" ? "اسم العنوان / التسمية" : "Address Label"}
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={locale === "ar" ? "مثال: المنزل، المكتب، بيت العائلة" : "e.g. Home, Office, Family"}
            startIcon={<Building className="w-4 h-4 text-neutral-400" />}
            variantSize="md"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            {t("checkout.contactPhone", "رقم الهاتف للتواصل")} <span className="text-semantic-error">*</span>
          </label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            placeholder="059xxxxxxx"
            startIcon={<Phone className="w-4 h-4 text-neutral-400" />}
            variantSize="md"
            className="numeric-data dir-ltr text-start font-mono"
            error={errors.phone}
          />
        </div>

        {/* City & Neighborhood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              {locale === "ar" ? "المدينة" : "City"} <span className="text-semantic-error">*</span>
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
              }}
              className="w-full h-11 px-3 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c.en} value={locale === "ar" ? c.ar : c.en}>
                  {locale === "ar" ? c.ar : c.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              {locale === "ar" ? "الحي / المنطقة" : "District / Neighborhood"}
            </label>
            <Input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder={locale === "ar" ? "مثال: حي الإرسال، رفيديا" : "e.g. Al-Irsal, Rafidia"}
              variantSize="md"
            />
          </div>
        </div>

        {/* Detailed Street Address */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            {t("checkout.deliveryAddress", "عنوان الشارع بالتفصيل")} <span className="text-semantic-error">*</span>
          </label>
          <Input
            type="text"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              if (errors.street) setErrors((prev) => ({ ...prev, street: "" }));
            }}
            placeholder={
              locale === "ar"
                ? "اسم الشارع، رقم البناية أو العمارة، الطابق"
                : "Street name, building, floor number"
            }
            startIcon={<MapPin className="w-4 h-4 text-neutral-400" />}
            variantSize="md"
            error={errors.street}
          />
        </div>

        {/* Notes for Driver */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            {locale === "ar" ? "معالم قريبة أو ملاحظات للمندوب" : "Nearby Landmarks / Driver Notes"}
          </label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={locale === "ar" ? "مثال: بجانب مسجد النور أو سوبرماركت الأمل" : "e.g. Next to Al-Noor Mosque"}
            startIcon={<FileText className="w-4 h-4 text-neutral-400" />}
            variantSize="md"
          />
        </div>

        {/* Default Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 text-brand-500 rounded border-neutral-300 focus:ring-brand-500"
          />
          <span className="text-xs text-neutral-700 font-medium select-none">
            {locale === "ar" ? "تعيين كعنوان افتراضي للتوصيل" : "Set as default delivery address"}
          </span>
        </label>
      </form>
    </Modal>
  );
}

export default NewAddressModal;
