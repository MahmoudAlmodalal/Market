import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "brand";

export type ButtonSize = "sm" | "md" | "default" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

/**
 * Button component supporting Souqi design variants (primary, secondary, outline, ghost, destructive)
 * with mobile-optimized active tactile scale feedback and accessible loading states.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      loading = false,
      isLoading = false,
      loadingText,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isActuallyLoading = loading || isLoading;
    const isDisabled = disabled || isActuallyLoading;

    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-brand-500 text-white shadow-none hover:bg-brand-600 active:bg-brand-700 hover:shadow-glow disabled:bg-brand-300 disabled:text-white disabled:shadow-none",
      secondary:
        "bg-brand-50 text-brand-600 hover:bg-brand-100 active:bg-brand-200 disabled:bg-neutral-100 disabled:text-neutral-400",
      outline:
        "bg-transparent border-[1.5px] border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100 disabled:border-neutral-300 disabled:text-neutral-400",
      ghost:
        "bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 disabled:text-neutral-400",
      destructive:
        "bg-semantic-error text-white hover:bg-red-700 active:bg-red-800 shadow-[0_4px_12px_rgba(217,45,63,0.2)] disabled:bg-red-300 disabled:text-white",
      brand:
        "bg-brand-500 text-white shadow-none hover:bg-brand-600 active:bg-brand-700 hover:shadow-glow disabled:bg-brand-300 disabled:text-white disabled:shadow-none",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-9 px-3.5 py-1.5 text-[13px] rounded-md gap-1.5",
      md: "h-12 px-5 py-2.5 text-[15px] rounded-md gap-2",
      default: "h-12 px-5 py-2.5 text-[15px] rounded-md gap-2",
      lg: "h-13 px-6 py-3.5 text-base rounded-md gap-2.5 min-h-[52px]",
      icon: "h-11 w-11 p-2 rounded-xl flex items-center justify-center",
    };

    const combinedClassName = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && "w-full",
      isDisabled && "cursor-not-allowed opacity-65 active:scale-100",
      className
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(combinedClassName, child.props?.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isActuallyLoading}
        aria-disabled={isDisabled}
        className={combinedClassName}
        {...props}
      >
        {isActuallyLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0 inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
