"use client";

import React, { useState } from "react";
import { MapPin, Phone, Plus, Check, Edit2 } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { NewAddressModal } from "./NewAddressModal";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/order";

export interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId?: number;
  onSelectAddress: (address: Address) => void;
  onAddAddress?: (address: Address) => void;
  onUpdateAddress?: (address: Address) => void;
  className?: string;
}

/**
 * AddressSelector renders saved delivery addresses as accessible radio cards
 * with default badges, selection rings, and add/edit address modal integration.
 */
export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddAddress,
  onUpdateAddress,
  className,
}: AddressSelectorProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaveModal = (savedAddr: Address) => {
    if (editingAddress) {
      if (onUpdateAddress) onUpdateAddress(savedAddr);
    } else {
      if (onAddAddress) {
        onAddAddress(savedAddr);
        onSelectAddress(savedAddr);
      }
    }
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  return (
    <div className={cn("w-full flex flex-col gap-3 text-start", className)}>
      <fieldset className="w-full">
        <legend className="sr-only">
          {locale === "ar" ? "اختر عنوان التوصيل" : "Select delivery address"}
        </legend>

        <div className="flex flex-col gap-2.5">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;

            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onSelectAddress(addr);
                  }
                }}
                className={cn(
                  "relative w-full p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none",
                  "flex items-start justify-between gap-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  isSelected
                    ? "bg-brand-50/40 border-brand-500 ring-2 ring-brand-500/20 shadow-sm"
                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                )}
              >
                {/* Radio selection circle */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                    isSelected
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-neutral-300 bg-white"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-neutral-900 truncate">
                      {addr.name || (locale === "ar" ? "العنوان" : "Address")}
                    </span>

                    {addr.is_default && (
                      <Badge variant="neutral" size="sm" className="text-[10px] px-1.5 py-0">
                        {locale === "ar" ? "افتراضي" : "Default"}
                      </Badge>
                    )}
                  </div>

                  {/* Street & Neighborhood */}
                  <div className="flex items-start gap-1.5 text-xs text-neutral-700">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {addr.city}
                      {addr.neighborhood ? `، ${addr.neighborhood}` : ""}
                      {`، ${addr.street}`}
                    </span>
                  </div>

                  {/* Phone */}
                  {addr.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-mono text-neutral-600 numeric-data">
                        {addr.phone}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {addr.notes && (
                    <p className="text-[11px] text-neutral-400 italic mt-0.5 line-clamp-1">
                      {addr.notes}
                    </p>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(addr, e)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
                  aria-label={locale === "ar" ? "تعديل العنوان" : "Edit address"}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* Add New Address Trigger */}
      <Button
        variant="outline"
        size="md"
        type="button"
        onClick={handleOpenAdd}
        className="w-full border-dashed border-neutral-300 hover:border-brand-500 hover:text-brand-600 font-semibold text-xs sm:text-sm h-11 rounded-2xl"
      >
        <Plus className="w-4 h-4 me-1 text-brand-500" />
        <span>{locale === "ar" ? "+ إضافة عنوان توصيل جديد" : "+ Add New Delivery Address"}</span>
      </Button>

      {/* Modal */}
      <NewAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialAddress={editingAddress}
      />
    </div>
  );
}

export default AddressSelector;
