import { cn } from "~/lib/cn";
import { filters } from "~/features/landing/data";

export function FilterBar() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-3 px-6 py-5">
        <span className="text-sm font-medium text-ink">Jelajahi:</span>
        {filters.map((filter, i) => (
          <button
            key={filter}
            type="button"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              i === 0
                ? "bg-primary text-on-primary"
                : "border border-hairline text-body hover:bg-canvas-subtle",
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </section>
  );
}
