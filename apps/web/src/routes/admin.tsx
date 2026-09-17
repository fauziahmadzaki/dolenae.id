import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p className="mt-2 text-slate-600">
        Placeholder dashboard admin: kelola destinasi, verifikasi kebutuhan
        pendukung, dan data pengguna.
      </p>
    </section>
  );
}