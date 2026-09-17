import type { ReactNode } from "react";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dolenae.id - Discover More, Prepare Better" },
      {
        name: "description",
        content:
          "Dolenae.id - platform travel discovery dan trip preparation untuk destinasi alam Indonesia.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <Link to="/" className="text-lg font-bold text-emerald-700">
              Dolenae.id
            </Link>
            <Link to="/destinations" className="text-sm hover:text-emerald-700">
              Destinasi
            </Link>
            <Link to="/admin" className="text-sm hover:text-emerald-700">
              Admin
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <Scripts />
      </body>
    </html>
  );
}