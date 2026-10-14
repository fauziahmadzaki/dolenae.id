import Link from "next/link";
import { SiteHeader } from "~/components/layout/site-header";
import { SiteFooter } from "~/components/layout/site-footer";

export const container = "mx-auto w-full max-w-[1248px] px-6";
export function PageHead({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return <section className="bg-canvas-subtle"><div className={`${container} flex flex-col gap-3 pt-16 pb-12`}>
    <nav aria-label="Breadcrumb" className="text-[13px]"><Link href="/" className="hover:underline">Beranda</Link> / {title}</nav>
    <h1 className="text-3xl font-bold leading-normal sm:text-[44px]">{title}</h1>
    <p className="max-w-[620px] text-base">{description}</p>{children}
  </div></section>;
}
export function PublicShell({ children }: { children: React.ReactNode }) {
  return <><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></>;
}
