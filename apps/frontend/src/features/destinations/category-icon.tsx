import {
  Camera,
  Circle,
  Footprints,
  Leaf,
  MapPin,
  Mountain,
  Sun,
  Tent,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "lucide:mountain": Mountain,
  "lucide:trees": Trees,
  "lucide:waves": Waves,
  "lucide:tent": Tent,
  "lucide:footprints": Footprints,
  "lucide:map-pin": MapPin,
  "lucide:sun": Sun,
  "lucide:leaf": Leaf,
  "lucide:camera": Camera,
  "lucide:circle": Circle,
};

/** Render a Lucide icon from its stored name (e.g. "lucide:mountain"). */
export function CategoryIcon({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  const Icon = ICONS[name ?? ""] ?? Circle;
  return <Icon aria-hidden className={className} strokeWidth={2} />;
}
