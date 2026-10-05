import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "~/components/site-chrome";

/**
 * Layout publik: header + footer "Alam" yang dipakai halaman wisatawan.
 * Halaman login tidak memakai layout ini (layout sendiri), begitu juga admin.
 */
export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
