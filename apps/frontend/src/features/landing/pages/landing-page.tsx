import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { AiSection } from "../components/ai-section";
import { FilterBar } from "../components/filter-bar";
import { Hero } from "../components/hero";
import { HowSection } from "../components/how-section";
import { Support } from "../components/support";
import { Testimonials } from "../components/testimonials";
import { Trending } from "../components/trending";

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <FilterBar />
        <Trending />
        <Support />
        <AiSection />
        <HowSection />
        <Testimonials />
      </main>
      <SiteFooter />
    </>
  );
}
