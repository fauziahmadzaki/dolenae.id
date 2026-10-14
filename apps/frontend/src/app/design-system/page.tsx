"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Select, type SelectOption } from "~/components/ui/select";
import { useToast } from "~/components/ui/toaster";

const fewOptions: SelectOption[] = [
  { value: "gunung", label: "Gunung" },
  { value: "bukit", label: "Bukit" },
  { value: "danau", label: "Danau" },
];

const manyOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: `destinasi-${i + 1}`,
  label: `Destinasi ${i + 1}`,
}));

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-hairline bg-surface p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-bold text-ink">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  const { toast } = useToast();
  const [terrain, setTerrain] = useState("gunung");
  const [destination, setDestination] = useState("");

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Design System — Alam
          </h1>
          <p className="text-sm text-body">Komponen dasar web Dolenae.</p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Beranda
        </Link>
      </header>

      <Section title="Button">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Input">
        <Input placeholder="Mau ke mana?" />
        <Input placeholder="Email tidak valid" aria-invalid defaultValue="nama@email" />
      </Section>

      <Section title="Select (combobox)">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-body">
              ≤ 7 opsi (tanpa kotak cari)
            </span>
            <Select
              options={fewOptions}
              value={terrain}
              onChange={setTerrain}
              placeholder="Pilih terrain"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-body">
              &gt; 7 opsi (dengan kotak cari)
            </span>
            <Select
              options={manyOptions}
              value={destination}
              onChange={setDestination}
              placeholder="Pilih destinasi"
              searchPlaceholder="Cari destinasi..."
            />
          </div>
        </div>
      </Section>

      <Section title="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Buka dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keluar dari akun?</DialogTitle>
              <DialogDescription>
                Kamu bisa masuk lagi kapan saja. Rencana dan checklist tetap
                tersimpan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Batal</Button>
              </DialogClose>
              <Button variant="primary">Keluar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Toaster">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => toast({ title: "Checklist tersimpan" })}
          >
            Info
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({ title: "Destinasi dipublikasikan", variant: "success" })
            }
          >
            Sukses
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({ title: "Gagal menyimpan, coba lagi", variant: "danger" })
            }
          >
            Gagal
          </Button>
        </div>
      </Section>
    </main>
  );
}
