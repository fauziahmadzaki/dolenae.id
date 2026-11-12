import { Check } from "lucide-react";
import { cn } from "~/lib/cn";

export interface FormStep {
  key: string;
  label: string;
}

interface DestinationFormStepperProps {
  steps: readonly FormStep[];
  current: number;
  onSelect: (index: number) => void;
}

export function DestinationFormStepper({
  steps,
  current,
  onSelect,
}: DestinationFormStepperProps) {
  return (
    <ol
      className="flex flex-wrap items-center gap-2"
      aria-label="Langkah formulir"
    >
      {steps.map((entry, index) => (
        <li key={entry.key} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(index)}
            aria-current={index === current ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-xs font-semibold transition-colors",
              index === current
                ? "bg-primary text-on-primary"
                : index < current
                  ? "bg-success/10 text-success"
                  : "bg-surface-2 text-body",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                index === current
                  ? "bg-on-primary/15"
                  : index < current
                    ? "bg-success text-white"
                    : "bg-surface text-body",
              )}
            >
              {index < current ? (
                <Check aria-hidden className="h-3.5 w-3.5" />
              ) : (
                index + 1
              )}
            </span>
            {entry.label}
          </button>
        </li>
      ))}
    </ol>
  );
}
