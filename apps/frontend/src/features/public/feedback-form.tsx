"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/cn";

const categories = ["Bug", "Saran", "Konten", "Lainnya"];

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [draft, setDraft] = useState("");

  return (
    <form
      className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface p-6 sm:p-8"
      onChange={() => setDraft("")}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const category = String(data.get("category"));
        const subject = String(data.get("subject")).trim();
        const message = String(data.get("message")).trim();
        if (!message) {
          const field = event.currentTarget.elements.namedItem("message") as HTMLTextAreaElement;
          field.setCustomValidity("Tulis detail masukanmu.");
          field.reportValidity();
          return;
        }
        const details = rating ? `\nPenilaian: ${rating}/5` : "";
        const body = `Kategori: ${category}${details}\n\n${message}`;
        setDraft(`mailto:halo@dolenae.id?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      }}
    >
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Kategori</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <label key={category} className="cursor-pointer">
              <input type="radio" name="category" value={category} defaultChecked={index === 0} className="peer sr-only" />
              <span className="inline-flex rounded-full border border-hairline px-4 py-2 text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">{category}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-3 text-sm font-semibold text-ink">
        Subjek
        <Input name="subject" placeholder="Ringkasan singkat" required maxLength={120} pattern=".*\S.*" />
      </label>
      <label className="grid gap-3 text-sm font-semibold text-ink">
        Pesan
        <textarea name="message" placeholder="Tulis detail masukanmu..." required maxLength={5000} onInput={(event) => event.currentTarget.setCustomValidity("")} className="min-h-35 rounded-md border border-hairline bg-canvas-subtle p-3.5 font-normal focus-visible:outline-2 focus-visible:outline-primary" />
      </label>
      <fieldset>
        <legend className="text-sm font-semibold text-ink">Penilaian</legend>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer">
              <input className="peer sr-only" type="radio" name="rating" aria-label={`${value} dari 5 bintang`} checked={rating === value} onChange={() => setRating(value)} />
              <span className="grid size-9 place-items-center rounded-md peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                <Star aria-hidden className={cn("size-5", value <= rating ? "text-accent" : "text-body")} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" size="lg">Siapkan masukan</Button>
      {draft && <p role="status" className="text-sm">Draf siap. <a href={draft} className="font-semibold text-primary underline">Buka aplikasi email untuk mengirim</a></p>}
    </form>
  );
}
