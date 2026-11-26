"use client";

import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  FileText,
  Layers,
  Mail,
  Menu,
  Mountain,
  Package,
  Search,
  Store,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { useDashboardStats } from "~/features/dashboard/hooks/use-dashboard-stats";
import {
  sanitizeLiveSearch,
  sanitizeUrlSearch,
  useShellSearchContext,
} from "./shell-search-context";
import { UserAvatar } from "./user-avatar";

export interface TopbarMeta {
  breadcrumb: string;
  title: string;
}

export type TopbarMetaSource =
  | Record<string, TopbarMeta>
  | ((pathname: string) => TopbarMeta | undefined);

/** Page meta rendered in the topbar left — extend as admin pages are added. */
export const ADMIN_PAGE_META: Record<string, TopbarMeta> = {
  "/admin": { breadcrumb: "Admin / Dashboard", title: "Ringkasan platform" },
  "/admin/destinasi": {
    breadcrumb: "Admin / Destinasi",
    title: "Destinasi & kategori",
  },
  "/admin/destinasi/baru": {
    breadcrumb: "Admin / Destinasi / Tambah",
    title: "Tambah destinasi",
  },
  "/admin/fasilitas": {
    breadcrumb: "Admin / Fasilitas",
    title: "Fasilitas",
  },
  "/admin/konten": {
    breadcrumb: "Admin / Konten",
    title: "Konten",
  },
  "/admin/verifikasi": { breadcrumb: "Admin / Verifikasi", title: "Verifikasi" },
  "/admin/pengaturan/integrasi": {
    breadcrumb: "Admin / Pengaturan",
    title: "Integrasi AI",
  },
  "/admin/merchant": { breadcrumb: "Admin / Merchant", title: "Merchant" },
  "/admin/users": { breadcrumb: "Admin / Pengguna", title: "Pengguna" },
};

function pageMeta(
  pathname: string,
  section: string,
  meta: TopbarMetaSource,
): TopbarMeta {
  const exact = typeof meta === "function" ? meta(pathname) : meta[pathname];
  if (exact) return exact;
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? section.toLowerCase();
  const pretty = segment.charAt(0).toUpperCase() + segment.slice(1);
  return { breadcrumb: `${section} / ${pretty}`, title: pretty };
}

interface TopbarProps {
  /** Opens the mobile sidebar drawer. */
  onMenuClick: () => void;
  section?: string;
  meta?: TopbarMetaSource;
  searchPlaceholder?: string;
}

/** Shared topbar for the admin and merchant shells. */
export function Topbar({
  onMenuClick,
  section = "Admin",
  meta = ADMIN_PAGE_META,
  searchPlaceholder = "Cari destinasi, pengguna, fasilitas…",
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user } = useAuth();
  const { breadcrumb, title } = pageMeta(pathname, section, meta);
  const dashboard = pathname === "/admin";
  const hideHeaderText = section === "Admin" || dashboard;

  const isAdmin = section === "Admin" && user?.role === "admin";
  const stats = useDashboardStats(6, token, Boolean(token) && isAdmin);
  const totals = stats.data?.totals;
  const pendingCount = totals?.facilities.pending ?? 0;
  const draftCount = totals?.destinations.draft ?? 0;

  const shellSearch = useShellSearchContext();
  const registration = shellSearch?.registration ?? null;
  const isLiveMode = registration !== null;

  const [globalQuery, setGlobalQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(min-width: 768px)").matches
      : true,
  );
  const quickJumpId = useId();
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const targetButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const suppressNextFocusOpenRef = useRef(false);
  const pendingOptionFocusFrameRef = useRef<number | null>(null);

  useEffect(() => {
    suppressNextFocusOpenRef.current = false;
    setGlobalQuery("");
    setSearchOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (
        pendingOptionFocusFrameRef.current !== null &&
        typeof cancelAnimationFrame === "function"
      ) {
        cancelAnimationFrame(pendingOptionFocusFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) {
        setMobileSearchOpen(false);
      }
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const frame = requestAnimationFrame(() => mobileInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [mobileSearchOpen]);

  const closeMobileSearch = (restoreFocus = false) => {
    setMobileSearchOpen(false);
    setSearchOpen(false);
    if (restoreFocus && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => mobileTriggerRef.current?.focus());
    }
  };

  const inputValue = isLiveMode ? registration.value : globalQuery;
  const activePlaceholder = isLiveMode
    ? registration.placeholder
    : searchPlaceholder;
  const hasInput = inputValue.length > 0;
  const hasTrimmedInput = inputValue.trim().length > 0;
  const desktopQuickJumpOpen =
    isDesktop && !mobileSearchOpen && !isLiveMode && searchOpen && hasTrimmedInput;
  const mobileQuickJumpOpen =
    mobileSearchOpen && !isLiveMode && searchOpen && hasTrimmedInput;
  const quickJumpOpen = desktopQuickJumpOpen || mobileQuickJumpOpen;

  useEffect(() => {
    if (!quickJumpOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const activeContainer = mobileSearchOpen
        ? mobileContainerRef.current
        : desktopContainerRef.current;
      if (activeContainer?.contains(event.target as Node)) return;
      setSearchOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [quickJumpOpen, mobileSearchOpen]);

  const handleContainerBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget as Node | null;
    if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
      setSearchOpen(false);
    }
  };

  const handleInputChange = (nextRaw: string) => {
    suppressNextFocusOpenRef.current = false;
    const sanitized = sanitizeLiveSearch(nextRaw);
    if (isLiveMode) {
      registration.onChange(sanitized);
      return;
    }
    setGlobalQuery(sanitized);
    setSearchOpen(sanitized.trim().length > 0);
  };

  const handleClear = (target: "desktop" | "mobile") => {
    if (isLiveMode) {
      registration.onChange("");
    } else {
      setGlobalQuery("");
      setSearchOpen(false);
    }
    const input =
      target === "mobile" ? mobileInputRef.current : desktopInputRef.current;
    input?.focus();
  };

  const navigateSearch = (basePath: string) => {
    const trimmed = sanitizeUrlSearch(globalQuery);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setGlobalQuery("");
    router.push(
      trimmed ? `${basePath}?search=${encodeURIComponent(trimmed)}` : basePath,
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isLiveMode) return;
    const trimmed = sanitizeUrlSearch(globalQuery);
    if (trimmed) {
      navigateSearch(isAdmin ? "/admin/destinasi" : "/merchant/fasilitas");
    } else {
      setSearchOpen(false);
    }
  };

  const searchTargets = isAdmin
    ? [
        { label: "Cari di Destinasi", href: "/admin/destinasi", icon: Mountain },
        { label: "Cari di Verifikasi", href: "/admin/verifikasi", icon: BadgeCheck },
        { label: "Cari di Pengguna", href: "/admin/users", icon: Users },
        { label: "Cari di Merchant", href: "/admin/merchant", icon: Store },
        { label: "Cari di Fasilitas", href: "/admin/fasilitas", icon: Layers },
        { label: "Cari di Konten", href: "/admin/konten", icon: FileText },
      ]
    : [
        { label: "Cari di Fasilitas saya", href: "/merchant/fasilitas", icon: Store },
        { label: "Cari di Produk saya", href: "/merchant/produk", icon: Package },
      ];

  const focusQuickJumpTarget = (index: number) => {
    const targetButton = targetButtonRefs.current[index];
    if (targetButton) {
      targetButton.focus();
      return;
    }
    if (typeof requestAnimationFrame === "function") {
      if (pendingOptionFocusFrameRef.current !== null) {
        cancelAnimationFrame(pendingOptionFocusFrameRef.current);
      }
      pendingOptionFocusFrameRef.current = requestAnimationFrame(() => {
        pendingOptionFocusFrameRef.current = null;
        targetButtonRefs.current[index]?.focus();
      });
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    target: "desktop" | "mobile",
  ) => {
    if (!isLiveMode && hasTrimmedInput) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!searchOpen) setSearchOpen(true);
        focusQuickJumpTarget(0);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!searchOpen) setSearchOpen(true);
        focusQuickJumpTarget(searchTargets.length - 1);
        return;
      }
    }

    if (event.key !== "Escape") return;
    event.preventDefault();
    if (isLiveMode) {
      if (registration.value.length > 0) {
        registration.onChange("");
      } else {
        event.currentTarget.blur();
        if (target === "mobile") closeMobileSearch(true);
      }
      return;
    }

    if (searchOpen) {
      setSearchOpen(false);
    } else if (globalQuery.length > 0) {
      setGlobalQuery("");
    } else {
      event.currentTarget.blur();
      if (target === "mobile") closeMobileSearch(true);
    }
  };

  const renderQuickJumpContent = () => (
    <div
      id={quickJumpId}
      role="region"
      aria-label="Pencarian cepat"
      className="absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-hairline bg-surface p-1.5 shadow-lg"
    >
      <p className="truncate px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-body">
        Pencarian cepat “{globalQuery.trim()}”
      </p>
      {searchTargets.map((target, index) => {
        const Icon = target.icon;
        return (
          <button
            key={target.href}
            ref={(el) => {
              targetButtonRefs.current[index] = el;
            }}
            type="button"
            onClick={() => navigateSearch(target.href)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                targetButtonRefs.current[
                  (index + 1) % searchTargets.length
                ]?.focus();
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                targetButtonRefs.current[
                  (index - 1 + searchTargets.length) % searchTargets.length
                ]?.focus();
              } else if (event.key === "Home") {
                event.preventDefault();
                targetButtonRefs.current[0]?.focus();
              } else if (event.key === "End") {
                event.preventDefault();
                targetButtonRefs.current[searchTargets.length - 1]?.focus();
              } else if (event.key === "Escape") {
                event.preventDefault();
                setSearchOpen(false);
                const targetInput = mobileSearchOpen
                  ? mobileInputRef.current
                  : desktopInputRef.current;
                if (targetInput && document.activeElement !== targetInput) {
                  suppressNextFocusOpenRef.current = true;
                  targetInput.focus();
                }
              }
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-canvas-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate">{target.label}</span>
            <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-body" />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative z-30 shrink-0">
      <header className="flex h-[76px] shrink-0 items-center gap-4 bg-canvas px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Buka menu navigasi"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-body transition-colors hover:bg-canvas-subtle hover:text-ink lg:hidden"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
          <div className={hideHeaderText ? "sr-only min-w-0" : "min-w-0"}>
            <p className="truncate text-xs text-body">{breadcrumb}</p>
            <h1 className="truncate text-[18px] font-bold text-ink">{title}</h1>
          </div>
        </div>

        <div
          ref={desktopContainerRef}
          onBlur={handleContainerBlur}
          className="relative hidden w-full max-w-[420px] min-w-0 md:block"
        >
          <form
            role="search"
            aria-label={activePlaceholder}
            onSubmit={handleSubmit}
            className="flex h-11 w-full min-w-0 items-center gap-2 rounded-full border border-hairline bg-surface pl-4 pr-1.5 transition-colors hover:border-border-strong focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
          >
            <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
            <input
              ref={desktopInputRef}
              type="search"
              maxLength={120}
              aria-label={activePlaceholder}
              aria-expanded={
                !isLiveMode && hasTrimmedInput ? desktopQuickJumpOpen : undefined
              }
              aria-controls={desktopQuickJumpOpen ? quickJumpId : undefined}
              value={inputValue}
              onFocus={() => {
                if (suppressNextFocusOpenRef.current) {
                  suppressNextFocusOpenRef.current = false;
                  return;
                }
                if (!isLiveMode && globalQuery.trim()) setSearchOpen(true);
              }}
              onChange={(event) => handleInputChange(event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, "desktop")}
              placeholder={activePlaceholder}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-body focus:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
            {hasInput && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => handleClear("desktop")}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-body transition-colors hover:bg-canvas-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            )}
          </form>
          {desktopQuickJumpOpen && renderQuickJumpContent()}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <button
            ref={mobileTriggerRef}
            type="button"
            aria-label="Buka pencarian"
            aria-expanded={mobileSearchOpen}
            onClick={() =>
              mobileSearchOpen
                ? closeMobileSearch(false)
                : setMobileSearchOpen(true)
            }
            className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-canvas-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98] md:hidden"
          >
            <Search aria-hidden className="h-[18px] w-[18px]" />
            {!mobileSearchOpen && hasTrimmedInput && (
              <span
                aria-hidden
                className="absolute right-2.5 top-2.5 size-2 rounded-full bg-accent"
              />
            )}
          </button>

          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Ringkasan aktivitas & pendaftar"
                className="inline-flex size-11 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-canvas-subtle"
              >
                <Mail aria-hidden className="h-[18px] w-[18px]" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={8}
                className="z-50 w-72 rounded-2xl border border-hairline bg-surface p-4 shadow-lg focus:outline-none"
              >
                <p className="font-display text-sm font-bold text-ink">
                  Ringkasan bulan ini
                </p>
                {isAdmin && totals ? (
                  <div className="mt-3 space-y-2 text-xs">
                    <Link
                      href="/admin/users"
                      className="flex items-center justify-between rounded-xl bg-canvas-subtle px-3 py-2 text-ink hover:bg-surface-2"
                    >
                      <span>Pengguna baru</span>
                      <span className="font-semibold text-primary">
                        +{totals.users.newThisMonth} akun
                      </span>
                    </Link>
                    <Link
                      href="/admin/merchant"
                      className="flex items-center justify-between rounded-xl bg-canvas-subtle px-3 py-2 text-ink hover:bg-surface-2"
                    >
                      <span>Merchant baru</span>
                      <span className="font-semibold text-primary">
                        +{totals.merchants.newThisMonth} mitra
                      </span>
                    </Link>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-body">
                    Pantau layanan dan profil melalui menu sebelah kiri.
                  </p>
                )}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Notifikasi"
                className="relative inline-flex size-11 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-canvas-subtle"
              >
                <Bell aria-hidden className="h-[18px] w-[18px]" />
                {pendingCount > 0 && (
                  <span
                    aria-hidden
                    className="absolute right-2.5 top-2.5 size-2 rounded-full bg-accent"
                  />
                )}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={8}
                className="z-50 w-76 rounded-2xl border border-hairline bg-surface p-4 shadow-lg focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-ink">Notifikasi</p>
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                      {pendingCount} baru
                    </span>
                  )}
                </div>
                {isAdmin && totals ? (
                  <div className="mt-3 space-y-2 text-xs">
                    <Link
                      href="/admin/verifikasi"
                      className="flex items-center gap-2.5 rounded-xl bg-canvas-subtle px-3 py-2.5 text-ink hover:bg-surface-2"
                    >
                      <BadgeCheck aria-hidden className="h-4 w-4 shrink-0 text-accent" />
                      <span className="flex-1">
                        {pendingCount} fasilitas menunggu verifikasi
                      </span>
                    </Link>
                    <Link
                      href="/admin/destinasi"
                      className="flex items-center gap-2.5 rounded-xl bg-canvas-subtle px-3 py-2.5 text-ink hover:bg-surface-2"
                    >
                      <Mountain aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                      <span className="flex-1">
                        {draftCount} destinasi berstatus draf
                      </span>
                    </Link>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-body">Tidak ada notifikasi baru.</p>
                )}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <span aria-hidden className="hidden h-7 w-px bg-hairline sm:block" />

          <Link
            href={isAdmin ? "/admin/pengaturan" : "/merchant/profil"}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-canvas-subtle"
          >
            <UserAvatar name={user?.name ?? section} className="size-10" />
            <div className="hidden max-w-44 lg:block">
              <p className="truncate text-sm font-semibold text-ink">
                {user?.name ?? section}
              </p>
              <p className="text-xs text-body">{section}</p>
            </div>
          </Link>
        </div>
      </header>

      {mobileSearchOpen && (
        <div className="border-b border-hairline bg-canvas px-4 pb-3 md:hidden">
          <div className="flex items-center gap-2">
            <div
              ref={mobileContainerRef}
              onBlur={handleContainerBlur}
              className="relative min-w-0 flex-1"
            >
              <form
                role="search"
                aria-label={activePlaceholder}
                onSubmit={handleSubmit}
                className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 transition-colors hover:border-border-strong focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
              >
                <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
                <input
                  ref={mobileInputRef}
                  type="search"
                  maxLength={120}
                  aria-label={activePlaceholder}
                  aria-expanded={
                    !isLiveMode && hasTrimmedInput ? mobileQuickJumpOpen : undefined
                  }
                  aria-controls={mobileQuickJumpOpen ? quickJumpId : undefined}
                  value={inputValue}
                  onFocus={() => {
                    if (suppressNextFocusOpenRef.current) {
                      suppressNextFocusOpenRef.current = false;
                      return;
                    }
                    if (!isLiveMode && globalQuery.trim()) setSearchOpen(true);
                  }}
                  onChange={(event) => handleInputChange(event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, "mobile")}
                  placeholder={activePlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-body focus:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                />
                {hasInput && (
                  <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => handleClear("mobile")}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-body transition-colors hover:bg-canvas-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
                  >
                    <X aria-hidden className="h-4 w-4" />
                  </button>
                )}
              </form>
              {mobileQuickJumpOpen && renderQuickJumpContent()}
            </div>
            <button
              type="button"
              aria-label="Tutup pencarian"
              onClick={() => closeMobileSearch(true)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-body transition-colors hover:bg-canvas-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
