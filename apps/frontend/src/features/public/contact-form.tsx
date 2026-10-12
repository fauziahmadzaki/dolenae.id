"use client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export function ContactForm() {
  const [draft, setDraft] = useState("");
  return <form className="flex min-w-0 flex-col gap-4 rounded-xl border border-hairline bg-surface p-6 sm:p-8" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setDraft(`mailto:halo@dolenae.id?subject=${encodeURIComponent(`Pesan dari ${String(data.get("name")).trim()}`)}&body=${encodeURIComponent(`Nama: ${String(data.get("name")).trim()}\nEmail: ${String(data.get("email")).trim()}\n\n${String(data.get("message")).trim()}`)}`);
  }}>
    <h2 className="text-xl font-bold">Kirim pesan</h2>
    <label htmlFor="contact-name" className="text-sm font-semibold text-ink">Nama</label><Input id="contact-name" name="name" autoComplete="name" placeholder="Nama lengkap" required maxLength={120} pattern=".*\S.*" />
    <label htmlFor="contact-email" className="text-sm font-semibold text-ink">Email</label><Input id="contact-email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required maxLength={254} />
    <label htmlFor="contact-message" className="text-sm font-semibold text-ink">Pesan</label><textarea id="contact-message" name="message" placeholder="Tulis pesanmu..." required maxLength={5000} className="min-h-30 w-full rounded-md border border-hairline bg-canvas-subtle p-3.5 text-sm text-ink placeholder:text-body focus-visible:outline-2 focus-visible:outline-primary" />
    <p className="text-xs" id="contact-limit">Form ini belum terhubung ke layanan pengiriman. Siapkan draf, lalu kirim melalui aplikasi emailmu. Pesan tidak dikirim atau disimpan di situs ini.</p>
    <Button type="submit" size="lg" aria-describedby="contact-limit">Siapkan pesan</Button>
    {draft && <div role="status" className="text-sm"><p>Draf siap. Pesan belum dikirim.</p><a href={draft} className="font-semibold text-primary underline">Buka aplikasi email</a></div>}
  </form>;
}
