"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

/**
 * QuantityStepper provides a numeric counter control with `+` and `-` buttons,
 * strictly clamped between min (default 1) and max stock limits.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
  size = "default",
  className,
}: QuantityStepperProps) {
  const isMin = value <= min;
  const isMax = max !== undefined && value >= max;

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMin && !disabled) {
      onChange(Math.max(min, value - 1));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMax && !disabled) {
      onChange(Math.min(max, value + 1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) {
      onChange(min);
    } else {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  const sizeConfigs = {
    sm: {
      container: "h-8",
      button: "w-8 h-8",
      input: "w-8 text-xs",
      icon: "w-3 h-3",
    },
    default: {
      container: "h-10",
      button: "w-10 h-10",
      input: "w-10 text-sm",
      icon: "w-4 h-4",
    },
    lg: {
      container: "h-12",
      button: "w-12 h-12",
      input: "w-12 text-base",
      icon: "w-5 h-5",
    },
  };

  const currentSize = sizeConfigs[size];

  return (
    <div
      role="group"
      aria-label="Quantity selector"
      className={cn(
        "inline-flex items-center rounded-xl bg-neutral-100 border border-neutral-200/90 overflow-hidden select-none",
        currentSize.container,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isMin || disabled}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center text-neutral-700 bg-white hover:bg-neutral-50 active:scale-95 transition-all outline-none",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:active:scale-100",
          "focus-visible:ring-2 focus-visible:ring-brand-500",
          currentSize.button
        )}
      >
        <Minus className={currentSize.icon} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="Current quantity"
        className={cn(
          "bg-transparent text-center font-bold text-neutral-900 numeric-data focus:outline-none",
          currentSize.input
        )}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isMax || disabled}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center text-neutral-700 bg-white hover:bg-neutral-50 active:scale-95 transition-all outline-none",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:active:scale-100",
          "focus-visible:ring-2 focus-visible:ring-brand-500",
          currentSize.button
        )}
      >
        <Plus className={currentSize.icon} />
      </button>
    </div>
  );
}

export default QuantityStepper;
