import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        success: "bg-success/15 text-success",
        process: "bg-muted text-muted-foreground",
        failed: "bg-danger/15 text-danger",
        income: "bg-success/15 text-success",
        expense: "bg-foreground/10 text-foreground",
        brand: "bg-brand/20 text-brand-foreground",
      },
      dot: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      dot: false,
    },
  },
);

const dotColor: Record<string, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-success",
  process: "bg-muted-foreground",
  failed: "bg-danger",
  income: "bg-success",
  expense: "bg-foreground",
  brand: "bg-brand",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const key = variant ?? "neutral";
  return (
    <span className={cn(badgeVariants({ variant, dot }), className)} {...props}>
      {dot && (
        <span
          className={cn("size-1.5 rounded-full", dotColor[key])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
