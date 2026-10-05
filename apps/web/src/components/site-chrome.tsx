import { Link } from "@tanstack/react-router";

/** Logo Dolenae (mark hutan + wordmark). */
export function Logo({ tone = "dark" }: Readonly<{ tone?: "dark" | "light" }>) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={
          tone === "light"
            ? "flex h-9 w-9 items-center justify-center rounded-[10px] bg-on-primary/10 text-on-primary"
            : "flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-on-primary"
        }
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
          aria-hidden="true"
        >
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight">
        Dolenae.id
      </span>
    </span>
  );
}

const NAV = [
  { to: "/destinations", label: "Destinasi", ready: true },
  { to: "#", label: "Fasilitas Sekitar", ready: false },
  { to: "#", label: "Persiapan AI", ready: false },
  { to: "#", label: "Tentang Kami", ready: false },
] as const;

/** Header publik sesuai desain web (surface + hairline bawah). */
export function SiteHeader() {
  return (
    <header className="border-b border-hairline bg-surface">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center px-[120px]">
        <Link to="/" className="text-ink">
          <Logo />
        </Link>

        <nav className="ml-auto hidden items-center gap-8 md:flex">
          {NAV.map((item) =>
            item.ready ? (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm text-body hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="cursor-default text-sm text-body/70"
                title="Segera hadir"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>

        <div className="ml-8 flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-[18px] py-2.5 text-sm font-semibold text-ink hover:bg-canvas-subtle"
          >
            Masuk
          </Link>
          <Link
            to="/login"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Footer publik (band primary). */
export function SiteFooter() {
  return (
    <footer className="bg-primary text-on-primary">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-[120px]">
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-on-primary/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </span>
          <span className="text-base font-bold">Dolenae.id</span>
        </span>

        <div className="flex items-center gap-6 text-[13px]">
          <Link to="/destinations" className="text-on-primary/80 hover:text-on-primary">
            Destinasi
          </Link>
          <span className="text-on-primary/70">Bantuan</span>
          <span className="text-on-primary/70">Privasi</span>
          <span className="text-xs font-medium text-on-primary/70">
            © 2026 Dolenae.id
          </span>
        </div>
      </div>
    </footer>
  );
}
