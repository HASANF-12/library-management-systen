import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#0F172A] text-white",
        secondary: "bg-[#E2E8F0] text-[#334155]",
        destructive: "bg-[#FEE2E2] text-[#991B1B]",
        outline: "border border-[#E2E8F0] text-[#0F172A] bg-transparent",
        available: "bg-[#D1FAE5] text-[#065F46]",
        borrowed: "bg-[#FEF3C7] text-[#92400E]",
        overdue: "bg-[#FEE2E2] text-[#991B1B]",
        archived: "bg-[#E2E8F0] text-[#334155]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
