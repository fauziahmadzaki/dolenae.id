"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { Field, textareaClass } from "~/features/destinations/components/form-field";
import { ErrorMessage } from "~/features/operations/shared";
import { feedbackSchema } from "~/features/operations/validation";
import { post } from "~/lib/api/client";
import type { z } from "zod";

export function FeedbackForm() {
  const { token, hydrated } = useAuth();
  const [category, setCategory] = useState("saran");
  const [validation, setValidation] = useState("");
  const mutation = useMutation({ mutationFn: (body: z.infer<typeof feedbackSchema>) => post("/feedback", body, { token: token ?? undefined }) });
  if (!hydrated) return <p role="status" className="text-sm text-body">Memeriksa sesi…</p>;
  if (!token) return <p className="text-sm text-body"><Link href="/auth/login" className="font-semibold text-primary underline">Masuk</Link> untuk mengirim masukan yang tersimpan ke tim Dolenae. Kontak email tetap tersedia tanpa akun.</p>;
  if (mutation.isSuccess) return <div role="status" className="space-y-3 rounded-xl border border-hairline bg-surface p-6"><p className="font-semibold text-success">Masukan tersimpan. Terima kasih.</p><Button variant="secondary" onClick={() => mutation.reset()}>Kirim masukan lain</Button></div>;
  return <form className="space-y-4 rounded-xl border border-hairline bg-surface p-6" onSubmit={(event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const rating = String(form.get("rating") ?? "");
    const result = feedbackSchema.safeParse({ category, subject: form.get("subject"), message: form.get("message"), ...(rating === "" ? {} : { rating: Number(rating) }) });
    if (!result.success) { setValidation(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ")); return; } setValidation(""); mutation.mutate(result.data);
  }}><h2 className="font-display text-xl font-bold text-ink">Kirim masukan ke Dolenae</h2><fieldset className="space-y-4" disabled={mutation.isPending}><Field label="Kategori" htmlFor="feedback-category"><Select id="feedback-category" value={category} options={[{ value: "bug", label: "Bug" }, { value: "saran", label: "Saran" }, { value: "konten", label: "Konten" }, { value: "lainnya", label: "Lainnya" }]} onChange={setCategory} /></Field><Field label="Subjek" htmlFor="feedback-subject"><Input id="feedback-subject" name="subject" required minLength={3} maxLength={160} /></Field><Field label="Pesan" htmlFor="feedback-message"><textarea id="feedback-message" name="message" required minLength={10} maxLength={5000} rows={5} className={textareaClass} /></Field><Field label="Penilaian (0–5)" htmlFor="feedback-rating" optional><Input id="feedback-rating" name="rating" type="number" min={0} max={5} step={1} /></Field></fieldset>{validation && <p role="alert" className="text-sm text-danger">{validation}</p>}<ErrorMessage error={mutation.error} /><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Mengirim…" : "Kirim masukan"}</Button></form>;
}
