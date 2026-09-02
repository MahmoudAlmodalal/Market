import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverElevation?: boolean;
  bordered?: boolean;
  padding?: "none" | "sm" | "default" | "lg";
}

/**
 * Card primitive matching the 20px rounded-card token and soft elevation design.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverElevation = false,
      bordered = true,
      padding = "default",
      children,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: "p-0",
      sm: "p-3",
      default: "p-4",
      lg: "p-5",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-card overflow-hidden shadow-soft-sm transition-all duration-200",
          bordered && "border border-neutral-200/90",
          hoverElevation && "hover:shadow-soft-lg hover:-translate-y-0.5 cursor-pointer",
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 pb-3 text-start", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-bold text-neutral-900 leading-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-neutral-500 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between pt-3 mt-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
