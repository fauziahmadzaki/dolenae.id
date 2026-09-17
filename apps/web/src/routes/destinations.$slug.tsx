import { createFileRoute } from "@tanstack/react-router";
import { getDestinationBySlug } from "~/features/destinations/api";

export const Route = createFileRoute("/destinations/$slug")({
  component: DestinationDetailPage,
  loader: async ({ params }) => getDestinationBySlug({ data: params.slug }),
  notFoundComponent: () => <p>Destinasi tidak ditemukan</p>,
});

export function DestinationDetailPage() {
  const destination = Route.useLoaderData();

  if (!destination) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm text-slate-500">{destination.location.province}</p>
      <h1 className="text-3xl font-extrabold">{destination.name}</h1>
      <p className="mt-2 text-slate-600">{destination.description}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Akses</h2>
          <p className="mt-2 text-sm text-slate-600">
            {destination.access.description}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {destination.access.estimatedTravelTime}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Kebutuhan Pendukung</h2>
          {destination.supports.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Belum ada data.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {destination.supports.map((s) => (
                <li key={s.id} className="text-slate-600">
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}