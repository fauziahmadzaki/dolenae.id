import Link from "next/link";
const filters = [{ label: "Semuanya", href: "/destinations" }, { label: "Ramah Pemula", href: "/destinations?difficulty=ramah-pemula" }, { label: "Menengah", href: "/destinations?difficulty=menengah" }, { label: "Sulit", href: "/destinations?difficulty=sulit" }];

export function FilterBar() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-3 px-6 py-5">
        <span className="text-sm font-medium text-ink">Jelajahi:</span>
        {filters.map((filter) => (
          <Link key={filter.label} href={filter.href} className="rounded-full border border-hairline px-4 py-1.5 text-sm font-medium text-primary hover:bg-canvas-subtle">
            {filter.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
