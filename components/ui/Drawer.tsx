"use client";

import React, { useEffect, useRef, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

/**
 * Slide-up mobile Drawer / Bottom Sheet component with drag handle,
 * smooth spring entrance, overlay dismissal, and safe-area padding.
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className={cn(
          "relative z-50 w-full max-w-[430px] bg-white rounded-t-3xl shadow-soft-lg border-t border-neutral-200/90 overflow-hidden",
          "animate-in slide-in-from-bottom duration-300 ease-out max-h-[85vh] flex flex-col pb-[max(env(safe-area-inset-bottom),16px)]",
          className
        )}
      >
        {/* Pull / Drag Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-neutral-100">
            <div className="flex flex-col gap-0.5 text-start pe-4">
              {title && (
                <h2
                  id={titleId}
                  className="text-base font-bold text-neutral-900 leading-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="text-xs text-neutral-500 leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Close sheet"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="px-5 py-4 overflow-y-auto flex-1 text-sm text-neutral-800">
          {children}
        </div>

        {/* Footer Actions */}
        {footer && (
          <div className="px-5 pt-3 border-t border-neutral-100 mt-auto bg-neutral-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Drawer;
