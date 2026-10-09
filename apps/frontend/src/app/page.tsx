import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <p className="text-sm font-semibold tracking-wide text-primary">
        Dolenae.id
      </p>
      <h1 className="font-display text-4xl font-extrabold text-ink">
        Discover More, Prepare Better.
      </h1>
      <p className="max-w-xl text-lg text-body">
        Platform travel discovery dan persiapan perjalanan untuk destinasi alam
        Indonesia — pegunungan, perbukitan, dan wisata alam sejenis.
      </p>
      <div>
        <Link
          href="/design-system"
          className="text-sm font-medium text-primary hover:underline"
        >
          Lihat Design System →
        </Link>
      </div>
    </main>
  );
}
