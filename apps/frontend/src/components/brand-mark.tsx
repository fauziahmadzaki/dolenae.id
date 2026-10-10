import { Mountain } from "lucide-react";
import { cn } from "~/lib/cn";

interface BrandMarkProps {
  size?: number;
  /** Corner radius of the tile. */
  rounded?: string;
  iconClassName?: string;
  className?: string;
}

/** Dolenae brand tile (mountain glyph on a primary square). Shared by all skins. */
export function BrandMark({
  size = 36,
  rounded = "rounded-[10px]",
  iconClassName,
  className,
}: BrandMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-primary text-on-primary",
        rounded,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Mountain
        style={{ width: size * 0.55, height: size * 0.55 }}
        strokeWidth={2}
        className={iconClassName}
      />
    </span>
  );
}