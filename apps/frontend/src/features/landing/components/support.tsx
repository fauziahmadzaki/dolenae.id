import { BadgeCheck, Bed, Car, Utensils } from "lucide-react";
import { get } from "~/lib/api/server";
import { PublicFetchError } from "~/features/public/fetch-error";
import { rupiah, supportCategories, type TravelSupport } from "~/features/operations/types";

const icons = { accommodation: Bed, transport: Car, food: Utensils };

export function SupportCards({ supports }: { supports: TravelSupport[] }) {
  return <div className="grid gap-6 md:grid-cols-3">{supports.map((support) => {
    const Icon = icons[support.category];
    return <article key={support.id} className="flex gap-4 rounded-xl border border-hairline bg-surface p-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-primary"><Icon aria-hidden className="h-5 w-5" /></span><div className="flex min-w-0 flex-col gap-2"><h3 className="font-display text-base font-bold text-ink">{support.name}</h3>{support.verified && <span className="inline-flex items-center gap-1 text-xs font-semibold text-success"><BadgeCheck aria-hidden className="h-3.5 w-3.5" />Terverifikasi</span>}<p className="text-sm text-body">{[supportCategories.find((c) => c.value === support.category)?.label, support.distanceLabel, support.locationLabel].filter(Boolean).join(" · ")}</p><p className="text-sm font-semibold text-ink">{support.priceLabel ?? (support.priceMin == null ? "Harga belum tersedia" : rupiah(support.priceMin))}</p>{support.description && <p className="whitespace-pre-wrap text-sm text-body">{support.description}</p>}{support.contactPhone && <p className="text-sm text-body">Telepon: {support.contactPhone}</p>}{support.contactWhatsapp && <p className="text-sm text-body">WhatsApp: {support.contactWhatsapp}</p>}</div></article>;
  })}</div>;
}

export async function Support() {
  let supports: TravelSupport[] | null = null;
  try { supports = (await get<TravelSupport[]>("/supports?limit=3&sort=createdAt&order=desc")).data; } catch { /* No fabricated fallback. */ }
  return (
    <section id="support" className="bg-canvas-subtle py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-extrabold text-ink">
            Ekosistem pendukung
          </h2>
          <p className="mt-1 text-body">
            Penginapan, transportasi, dan tempat makan di sekitar destinasi.
          </p>
        </div>
        {supports === null ? <PublicFetchError /> : supports.length ? <SupportCards supports={supports} /> : <p className="text-sm text-body">Belum ada fasilitas yang diterbitkan.</p>}
      </div>
    </section>
  );
}
