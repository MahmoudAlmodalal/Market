import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "brand"
  | "success"
  | "warning"
  | "error"
  | "danger"
  | "info"
  | "ai"
  | "neutral";

export type BadgeSize = "sm" | "md" | "default" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
}

/**
 * Semantic Badge & Chip component for stock status, tags, and AI labels.
 */
export function Badge({
  className,
  variant = "default",
  size = "default",
  dot = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    default: {
      container: "bg-neutral-100 text-neutral-700 border border-neutral-200",
      dot: "bg-neutral-500",
    },
    primary: {
      container: "bg-brand-50 text-brand-600 border border-brand-200 font-semibold",
      dot: "bg-brand-500",
    },
    brand: {
      container: "bg-brand-50 text-brand-600 border border-brand-200 font-semibold",
      dot: "bg-brand-500",
    },
    success: {
      container: "bg-[#E8F8F0] text-semantic-success border border-[#B7ECCF] font-semibold",
      dot: "bg-semantic-success",
    },
    warning: {
      container: "bg-[#FFF6E9] text-semantic-warning border border-[#FCE2B8] font-semibold",
      dot: "bg-semantic-warning",
    },
    error: {
      container: "bg-[#FDE8EA] text-semantic-error border border-red-200 font-semibold",
      dot: "bg-semantic-error",
    },
    danger: {
      container: "bg-[#FDE8EA] text-semantic-error border border-red-200 font-semibold",
      dot: "bg-semantic-error",
    },
    info: {
      container: "bg-[#F0F5FF] text-semantic-info border border-[#D0E2FF] font-medium",
      dot: "bg-semantic-info",
    },
    ai: {
      container: "bg-[#F0F5FF] text-[#2563EB] border border-[#BFDBFE] font-semibold",
      dot: "bg-[#2563EB]",
    },
    neutral: {
      container: "bg-neutral-100 text-neutral-600 border border-neutral-200/80 font-medium",
      dot: "bg-neutral-400",
    },
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: "text-[11px] px-2 py-0.5 gap-1 min-h-[20px]",
    md: "text-xs px-2.5 py-1 gap-1.5 min-h-[24px]",
    default: "text-xs px-2.5 py-1 gap-1.5 min-h-[24px]",
    lg: "text-sm px-3 py-1.5 gap-2 min-h-[28px]",
  };

  const config = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-pill transition-colors duration-150 leading-none select-none",
        config.container,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)}
          aria-hidden="true"
        />
      )}
      {variant === "ai" && !icon && (
        <Sparkles className="w-3 h-3 text-[#2563EB] shrink-0" aria-hidden="true" />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}

export default Badge;
