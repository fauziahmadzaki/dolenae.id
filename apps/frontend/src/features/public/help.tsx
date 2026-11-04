"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "~/lib/api/client";
import type { Faq } from "~/features/operations/types";
import { ErrorMessage } from "~/features/operations/shared";
import Link from "next/link";
import { User, Route, Bed, Database, Search, ChevronDown } from "lucide-react";
import { container, PageHead } from "./page-shell";
const categories = [
  { title: "Akun", text: "Daftar, masuk, dan keamanan akunmu.", Icon: User },
  { title: "Perjalanan", text: "Rencana, checklist, dan akses menuju lokasi.", Icon: Route },
  { title: "Fasilitas", text: "Penginapan, transportasi, dan kuliner sekitar.", Icon: Bed },
  { title: "Data", text: "Privasi dan pengelolaan data kamu.", Icon: Database },
];

export function Help() {
  const list = useQuery({ queryKey: ["public", "faqs"], queryFn: ({ signal }) => get<Faq[]>("/faqs", { signal }), retry: false });
  const questions = (list.data?.data ?? []).map((item) => ({ ...item, category: item.category[0].toUpperCase() + item.category.slice(1) }));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const visible = questions.filter((item) => (!category || item.category === category) && `${item.question} ${item.answer} ${item.category}`.toLocaleLowerCase("id").includes(search.trim().toLocaleLowerCase("id")));
  return <><PageHead title="Pusat Bantuan" description="Temukan jawaban seputar akun, perjalanan, fasilitas, dan data di Dolenae."><label className="flex h-13 w-full max-w-[520px] items-center gap-3 rounded-full border border-hairline bg-surface px-4.5"><Search size={20} aria-hidden="true" /><input aria-label="Cari bantuan" placeholder="Cari bantuan..." type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none" /></label></PageHead>
    <div className={`${container} space-y-12 py-12`}>
      {list.isPending && <p role="status">Memuat bantuan…</p>}
      <ErrorMessage error={list.error} retry={() => void list.refetch()} />
      <section><h2 className="mb-9 text-2xl font-bold">Jelajahi berdasarkan kategori</h2><div className="grid grid-cols-2 gap-10 md:grid-cols-4">{categories.map(({ title, text, Icon }) => <button key={title} type="button" aria-pressed={category === title} onClick={() => setCategory(category === title ? "" : title)} className="flex flex-col items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-primary"><span className={`flex size-10 items-center justify-center rounded-md ${category === title ? "bg-primary text-on-primary" : "bg-canvas-subtle text-primary"}`}><Icon size={20} /></span><span className="font-display text-[17px] font-bold text-ink">{title}</span><span className="text-sm">{text}</span></button>)}</div></section>
      <section><div className="mb-4 flex flex-wrap items-center gap-4"><h2 className="text-2xl font-bold">Pertanyaan umum</h2>{category && <button onClick={() => setCategory("")} className="text-sm text-primary underline">Semua kategori</button>}</div><div className="space-y-4">{visible.map((item) => <details key={item.question} className="group rounded-lg border border-hairline bg-surface p-5.5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-ink [&::-webkit-details-marker]:hidden">{item.question}<ChevronDown className="shrink-0 group-open:rotate-180" size={20} /></summary><p className="mt-4 text-sm leading-6">{item.answer}</p></details>)}{list.isSuccess && !visible.length && <p role="status">Tidak ada bantuan yang cocok. Coba kata kunci lain atau <Link href="/kontak" className="text-primary underline">hubungi kami</Link>.</p>}</div></section>
    </div></>;
}
