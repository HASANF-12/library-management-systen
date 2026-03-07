import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus-visible:ring-[#2563EB]",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
        outline: "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:ring-[#2563EB]",
        secondary: "bg-[#E2E8F0] text-[#0F172A] hover:bg-[#CBD5E1] focus-visible:ring-[#94A3B8]",
        ghost: "text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] focus-visible:ring-[#94A3B8]",
        link: "text-[#2563EB] underline-offset-4 hover:underline hover:text-[#1D4ED8]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
