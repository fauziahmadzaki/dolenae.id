import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-lg border border-hairline bg-canvas-subtle px-3.5 text-sm text-ink",
        "placeholder:text-body focus-visible:border-border-strong focus-visible:outline-none",
        "aria-[invalid=true]:border-2 aria-[invalid=true]:border-danger",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
