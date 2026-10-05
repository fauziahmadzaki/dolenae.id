import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/")({
  component: Home,
});

function Home() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Discover More,{" "}
        <span className="text-emerald-700">Prepare Better.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        Platform travel discovery dan trip preparation untuk destinasi alam
        Indonesia - pegunungan, perbukitan, dan wisata alam lainnya.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/destinations"
          className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Jelajahi Destinasi
        </Link>
      </div>
    </section>
  );
}
