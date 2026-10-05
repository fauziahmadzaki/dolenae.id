import { createFileRoute, notFound } from "@tanstack/react-router";
import { getDestinationBySlug } from "~/features/destinations/api";
import { MapView, type MapPoint } from "~/components/map-view";

export const Route = createFileRoute("/_public/destinations/$slug")({
  component: DestinationDetailPage,
  loader: async ({ params }) => {
    const destination = await getDestinationBySlug(params.slug);
    if (!destination) throw notFound();
    return destination;
  },
  notFoundComponent: () => <p>Destinasi tidak ditemukan</p>,
});

function DestinationDetailPage() {
  const destination = Route.useLoaderData();

  if (!destination) return null;

  const { latitude, longitude } = destination.location.coordinate;
  const points: MapPoint[] = [];
  if (Number.isFinite(latitude) && Number.isFinite(longitude) && !(latitude === 0 && longitude === 0)) {
    points.push({
      id: "destination",
      lat: latitude,
      lng: longitude,
      label: destination.name,
      meta: `${destination.location.regency}, ${destination.location.province}`,
      href: `https://maps.google.com/?q=${latitude},${longitude}`,
    });
  }
  const accessPoint = destination.location.accessPoint;
  if (accessPoint) {
    points.push({
      id: "access-point",
      lat: accessPoint.coordinate.latitude,
      lng: accessPoint.coordinate.longitude,
      label: accessPoint.name,
      meta: "Titik akses / basecamp",
      featured: true,
      href: `https://maps.google.com/?q=${accessPoint.coordinate.latitude},${accessPoint.coordinate.longitude}`,
    });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm text-slate-500">
        {[destination.location.district, destination.location.regency, destination.location.province]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <h1 className="text-3xl font-extrabold">{destination.name}</h1>
      <p className="mt-2 text-slate-600">{destination.description}</p>

      {points.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">Lokasi</h2>
          <MapView points={points} height={360} />
        </div>
      )}

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
