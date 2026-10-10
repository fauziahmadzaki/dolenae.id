import { Mail, Phone, MapPin } from "lucide-react";
import { container, PageHead, PublicShell } from "~/features/public/page-shell";
import { ContactForm } from "~/features/public/contact-form";
export const metadata = { title: "Kontak | Dolenae.id" };
export default function ContactPage() {
  return <PublicShell><PageHead title="Kontak" description="Ada pertanyaan atau ingin bekerja sama? Hubungi kami." />
    <div className={`${container} grid gap-10 pt-18 pb-24 lg:grid-cols-[420px_1fr]`}>
      <section aria-label="Informasi kontak" className="space-y-4">
        {[{ Icon: Mail, label: "Email", value: "halo@dolenae.id", href: "mailto:halo@dolenae.id" }, { Icon: Phone, label: "Telepon", value: "+62 812-3456-7890" }, { Icon: MapPin, label: "Alamat", value: "Jakarta, Indonesia" }].map(({ Icon, label, value, href }) => <div key={label} className="flex items-center gap-3.5 rounded-lg border border-hairline bg-surface p-5"><span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-canvas-subtle text-primary"><Icon size={20} /></span><div><p className="text-[13px]">{label}</p>{href ? <a href={href} className="font-semibold text-ink hover:underline">{value}</a> : <p className="font-semibold text-ink">{value}</p>}</div></div>)}
        <p className="text-xs">Detail kontak mengikuti desain Figma; nomor telepon belum diverifikasi.</p>
      </section><ContactForm />
    </div></PublicShell>;
}
