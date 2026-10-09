"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-primary-hover disabled:bg-canvas-subtle disabled:text-body",
        secondary:
          "border border-border-strong bg-surface text-primary hover:bg-canvas-subtle disabled:border-hairline disabled:text-body",
        ghost:
          "bg-transparent text-primary hover:bg-canvas-subtle disabled:text-body",
      },
      size: {
        sm: "h-8 rounded-full px-3 text-[13px]",
        md: "h-10 rounded-full px-4 text-sm",
        lg: "h-12 rounded-full px-5 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
