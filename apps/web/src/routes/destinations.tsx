import { Link, createFileRoute } from "@tanstack/react-router";
import { listDestinations } from "~/features/destinations/api";

export const Route = createFileRoute("/destinations")({
  component: DestinationsPage,
  loader: async () => await listDestinations(),
});

export function DestinationsPage() {
  const destinations = Route.useLoaderData();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Destinasi</h1>
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