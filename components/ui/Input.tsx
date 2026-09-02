import React, { forwardRef, useState, useId } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  variantSize?: "default" | "sm" | "md" | "lg";
  size?: "default" | "sm" | "md" | "lg";
}

/**
 * Input component for Souqi Marketplace.
 * Supports logical properties, focus rings, clear buttons, start/end icons, and validation error messages.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      clearable = false,
      onClear,
      id,
      value,
      onChange,
      disabled,
      variantSize,
      size = "default",
      type = "text",
      ...props
    },
    ref
  ) => {
    const effectiveSize = variantSize || size;
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasValue = value !== undefined && value !== "";

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onClear) {
        onClear();
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={cn("w-full flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-neutral-800 select-none text-start"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {startIcon && (
            <div className="absolute start-3.5 flex items-center justify-center text-neutral-400 pointer-events-none z-10">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "w-full bg-white text-neutral-800 placeholder:text-neutral-400 font-medium",
              "border-[1.5px] border-neutral-200 rounded-md transition-all duration-150",
              "outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50",
              effectiveSize === "sm" ? "h-10 px-3 text-sm" : "h-12 px-4 text-[15px]",
              startIcon && "ps-10",
              (endIcon || clearable) && "pe-10",
              error && "border-semantic-error focus:border-semantic-error focus:ring-red-50",
              disabled && "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute end-3 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {!clearable && endIcon && (
            <div className="absolute end-3.5 flex items-center justify-center text-neutral-400 pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-xs font-semibold text-semantic-error text-start">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-neutral-500 text-start">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
