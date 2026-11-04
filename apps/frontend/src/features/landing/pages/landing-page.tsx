import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { AiSection } from "../components/ai-section";
import { FilterBar } from "../components/filter-bar";
import { Hero } from "../components/hero";
import { HowSection } from "../components/how-section";
import { Support } from "../components/support";
import { Suspense } from "react";
import { Trending } from "../components/trending";

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <FilterBar />
        <Suspense fallback={<p role="status" className="p-6 text-sm text-body">Memuat destinasi…</p>}><Trending /></Suspense>
        <Suspense fallback={<p role="status" className="p-6 text-sm text-body">Memuat fasilitas…</p>}><Support /></Suspense>
        <AiSection />
        <HowSection />

      </main>
      <SiteFooter />
    </>
  );
}
