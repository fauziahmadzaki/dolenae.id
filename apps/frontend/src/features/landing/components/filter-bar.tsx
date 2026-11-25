import Link from "next/link";

const filters = [
  { label: "Semuanya", href: "/destinations", active: true },
  { label: "Ramah Pemula", href: "/destinations?difficulty=ramah-pemula" },
  { label: "Area Camping", href: "/destinations?category=camping-ground" },
  { label: "Spot Sunrise" },
  { label: "Transport Mudah" },
];

export function FilterBar() {
  return (
    <section className="border-y border-hairline bg-canvas">
      <div className="mx-auto flex min-h-16 max-w-[1248px] flex-wrap items-center justify-center gap-3 px-6 py-3">
        <span className="text-xs font-medium text-ink">Jelajahi:</span>
        {filters.map(({ label, href, active }) => {
          const className = `inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-medium ${active ? "border-primary bg-primary text-on-primary" : "border-hairline bg-canvas-subtle text-ink"}`;
          return href ? (
            <Link key={label} href={href} className={`${className} hover:underline`}>{label}</Link>
          ) : (
            <span key={label} className={className}>{label}</span>
          );
        })}
      </div>
    </section>
  );
}
