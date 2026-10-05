import { Link, createFileRoute } from "@tanstack/react-router";
import { listDestinations } from "~/features/destinations/api";
import { MapView, type MapPoint } from "~/components/map-view";

export const Route = createFileRoute("/_public/destinations")({
  component: DestinationsPage,
  loader: async () =>
    await listDestinations({ status: "published", limit: 100 }),
});

function DestinationsPage() {
  const destinations = Route.useLoaderData();

  const points: MapPoint[] = destinations
    .filter((d) => {
      const { latitude, longitude } = d.location.coordinate;
      return Number.isFinite(latitude) && Number.isFinite(longitude) && !(latitude === 0 && longitude === 0);
    })
    .map((d) => ({
      id: d.id,
      lat: d.location.coordinate.latitude,
      lng: d.location.coordinate.longitude,
      label: d.name,
      meta: d.location.province,
      href: `/destinations/${d.slug}`,
    }));

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Destinasi</h1>

      {points.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">
            Peta destinasi
          </h2>
          <MapView points={points} height={420} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {destinations.map((d) => (
          <Link
            key={d.id}
            to="/destinations/$slug"
            params={{ slug: d.slug }}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-500"
          >
            <h2 className="font-semibold">{d.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{d.tagline}</p>
            <p className="mt-2 text-xs text-slate-400">
              {d.location.province} · {d.difficulty}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
